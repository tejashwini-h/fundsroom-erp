import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function stockIn(req: Request, res: Response) {
  try {
    const { productId, quantity, reason } = req.body;
    const user = res.locals.user;

    if (
      productId === undefined ||
      quantity === undefined ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity and reason are required",
      });
    }

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedProductId) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity must be valid positive integers",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: parsedProductId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: parsedProductId,
        },
        data: {
          currentStock: {
            increment: parsedQuantity,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: parsedProductId,
          quantity: parsedQuantity,
          type: "IN",
          reason,
          createdBy: user.userId,
        },
      });

      return {
        updatedProduct,
        movement,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data: {
        product: {
          ...result.updatedProduct,
          lowStock:
            result.updatedProduct.currentStock <=
            result.updatedProduct.minimumStock,
        },
        movement: result.movement,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.error("Stock-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add stock",
    });
  }
}

export async function stockOut(req: Request, res: Response) {
  try {
    const { productId, quantity, reason } = req.body;
    const user = res.locals.user;

    if (
      productId === undefined ||
      quantity === undefined ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity and reason are required",
      });
    }

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedProductId) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity must be valid positive integers",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: parsedProductId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product.currentStock < parsedQuantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: parsedProductId,
        },
        data: {
          currentStock: {
            decrement: parsedQuantity,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: parsedProductId,
          quantity: parsedQuantity,
          type: "OUT",
          reason,
          createdBy: user.userId,
        },
      });

      return {
        updatedProduct,
        movement,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      data: {
        product: {
          ...result.updatedProduct,
          lowStock:
            result.updatedProduct.currentStock <=
            result.updatedProduct.minimumStock,
        },
        movement: result.movement,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    console.error("Stock-out error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove stock",
    });
  }
}

export async function getStockMovements(
  req: Request,
  res: Response
) {
  try {
    const productId =
      typeof req.query.productId === "string"
        ? Number(req.query.productId)
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Math.max(parseInt(req.query.page, 10) || 1, 1)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
          )
        : 10;

    const skip = (page - 1) * limit;

    const where =
      productId !== undefined && Number.isInteger(productId)
        ? { productId }
        : {};

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.stockMovement.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
}