import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function createChallan(
  req: Request,
  res: Response
) {
  try {
    const {
      customerId,
      items,
    } = req.body;

    const user = res.locals.user;

    if (
      customerId === undefined ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID and at least one item are required",
      });
    }

    const parsedCustomerId = Number(customerId);

    if (!Number.isInteger(parsedCustomerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const parsedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    for (const item of parsedItems) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have a valid product ID and positive quantity",
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: {
          id: parsedCustomerId,
        },
      });

      if (!customer) {
        throw new Error("CUSTOMER_NOT_FOUND");
      }

      const products = [];

      for (const item of parsedItems) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new Error(
            `PRODUCT_NOT_FOUND:${item.productId}`
          );
        }

        products.push({
          product,
          quantity: item.quantity,
        });
      }

      const totalQuantity = parsedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      // Generate challan number automatically
      const currentYear = new Date().getFullYear();

      const latestChallan =
        await tx.challan.findFirst({
          where: {
            challanNumber: {
              startsWith: `CH-${currentYear}-`,
            },
          },
          orderBy: {
            id: "desc",
          },
        });

      let nextNumber = 1;

      if (latestChallan) {
        const parts =
          latestChallan.challanNumber.split("-");

        const lastNumber = Number(parts[2]);

        if (Number.isInteger(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      const challanNumber =
        `CH-${currentYear}-${String(nextNumber).padStart(3, "0")}`;

      // Create challan as DRAFT
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: parsedCustomerId,
          totalQuantity,
          status: "DRAFT",
          createdBy: user.userId,
        },
      });

      // Create challan items only.
      // Stock is NOT deducted while creating a DRAFT.
      for (const item of products) {
        const { product, quantity } = item;

        await tx.challanItem.create({
          data: {
            challanId: challan.id,
            productId: product.id,
            quantity,
            productName: product.name,
            sku: product.sku,
            unitPrice: product.unitPrice,
          },
        });
      }

      return tx.challan.findUnique({
        where: {
          id: challan.id,
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CUSTOMER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (
      error instanceof Error &&
      error.message.startsWith("PRODUCT_NOT_FOUND:")
    ) {
      return res.status(404).json({
        success: false,
        message: "One or more products were not found",
      });
    }

    console.error(
      "Create challan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create challan",
    });
  }
}

export async function getChallans(
  req: Request,
  res: Response
) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const from =
      typeof req.query.from === "string"
        ? req.query.from
        : undefined;

    const to =
      typeof req.query.to === "string"
        ? req.query.to
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Math.max(
            parseInt(req.query.page, 10) || 1,
            1
          )
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Math.min(
            Math.max(
              parseInt(req.query.limit, 10) || 10,
              1
            ),
            100
          )
        : 10;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by challan number or customer name/business name
    if (search) {
      where.OR = [
        {
          challanNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            businessName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Status filter
    if (
      status === "DRAFT" ||
      status === "CONFIRMED" ||
      status === "CANCELLED"
    ) {
      where.status = status;
    } else if (status !== undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use DRAFT, CONFIRMED or CANCELLED",
      });
    }

    // Date range filter
    if (from || to) {
      where.createdAt = {};
    }

    if (from) {
      const fromDate = new Date(from);

      if (Number.isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid from date. Use YYYY-MM-DD",
        });
      }

      fromDate.setHours(0, 0, 0, 0);

      where.createdAt.gte = fromDate;
    }

    if (to) {
      const toDate = new Date(to);

      if (Number.isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid to date. Use YYYY-MM-DD",
        });
      }

      toDate.setHours(23, 59, 59, 999);

      where.createdAt.lte = toDate;
    }

    // Make sure from date is not after to date
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message:
            "From date cannot be after to date",
        });
      }
    }

    const [challans, total] =
      await Promise.all([
        prisma.challan.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),

        prisma.challan.count({
          where,
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get challans error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch challans",
    });
  }
}

export async function getChallanById(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const challan =
      await prisma.challan.findUnique({
        where: {
          id,
        },
        include: {
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error(
      "Get challan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
}

export async function updateChallanStatus(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const user = res.locals.user;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    if (
      status !== "DRAFT" &&
      status !== "CONFIRMED" &&
      status !== "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan status",
      });
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const challan =
            await tx.challan.findUnique({
              where: {
                id,
              },
              include: {
                items: true,
              },
            });

          if (!challan) {
            throw new Error(
              "CHALLAN_NOT_FOUND"
            );
          }

          // Confirming a challan
          if (
            status === "CONFIRMED" &&
            challan.status !== "CONFIRMED"
          ) {
            // Check ALL products before changing anything
            for (const item of challan.items) {
              const product =
                await tx.product.findUnique({
                  where: {
                    id: item.productId,
                  },
                });

              if (!product) {
                throw new Error(
                  `PRODUCT_NOT_FOUND:${item.productId}`
                );
              }

              if (
                product.currentStock <
                item.quantity
              ) {
                throw new Error(
                  `INSUFFICIENT_STOCK:${product.name}`
                );
              }
            }

            // Deduct stock only after every
            // product has sufficient stock.
            for (const item of challan.items) {
              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  currentStock: {
                    decrement: item.quantity,
                  },
                },
              });

              await tx.stockMovement.create({
                data: {
                  productId: item.productId,
                  quantity: item.quantity,
                  type: "OUT",
                  reason:
                    `Sales challan ${challan.challanNumber}`,
                  createdBy: user.userId,
                },
              });
            }
          }

          const updatedChallan =
            await tx.challan.update({
              where: {
                id,
              },
              data: {
                status,
              },
              include: {
                customer: true,
                items: true,
              },
            });

          return updatedChallan;
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Challan status updated successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CHALLAN_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "PRODUCT_NOT_FOUND:"
      )
    ) {
      return res.status(404).json({
        success: false,
        message:
          "One or more products were not found",
      });
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Insufficient stock for ${
            error.message.split(":")[1]
          }`,
      });
    }

    console.error(
      "Update challan status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update challan status",
    });
  }
}