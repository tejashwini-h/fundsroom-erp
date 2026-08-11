import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouse,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      unitPrice === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        success: false,
        message: "Required product fields are missing",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice,
        currentStock: currentStock ?? 0,
        minimumStock: minimumStock ?? 0,
        warehouse,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        ...product,
        lowStock: product.currentStock <= product.minimumStock,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

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

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              sku: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              warehouse: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    const data = products.map((product) => ({
      ...product,
      lowStock: product.currentStock <= product.minimumStock,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function getProductById(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        lowStock: product.currentStock <= product.minimumStock,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export async function updateProduct(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouse,
    } = req.body;

    if (sku !== undefined && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: {
          sku,
        },
      });

      if (skuExists) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(category !== undefined && { category }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(currentStock !== undefined && { currentStock }),
        ...(minimumStock !== undefined && { minimumStock }),
        ...(warehouse !== undefined && { warehouse }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        ...product,
        lowStock: product.currentStock <= product.minimumStock,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export async function deleteProduct(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const movementCount = await prisma.stockMovement.count({
      where: {
        productId: id,
      },
    });

    if (movementCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Product cannot be deleted because it has stock movement history",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
}