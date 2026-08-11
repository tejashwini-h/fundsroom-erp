import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function createCustomer(req: Request, res: Response) {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !businessName ||
      !customerType ||
      !address ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Required customer fields are missing",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
        notes,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
}

export async function getCustomers(req: Request, res: Response) {
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
              mobile: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              businessName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

export async function getCustomerById(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}

export async function updateCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(mobile !== undefined && { mobile }),
        ...(email !== undefined && { email }),
        ...(businessName !== undefined && { businessName }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(customerType !== undefined && { customerType }),
        ...(address !== undefined && { address }),
        ...(status !== undefined && { status }),
        ...(followUpDate !== undefined && {
          followUpDate: followUpDate
            ? new Date(followUpDate)
            : null,
        }),
        ...(notes !== undefined && { notes }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
}

export async function deleteCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
}