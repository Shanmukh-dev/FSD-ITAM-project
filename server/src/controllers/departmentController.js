import Department from '../models/Department.js';
import User from '../models/User.js';
import Asset from '../models/Asset.js';

// @desc    Get all departments enriched with dynamic employee and asset counts
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email')
      .sort({ name: 1 });

    // Aggregate real counts for each department
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const [employeeCount, assetCount] = await Promise.all([
          User.countDocuments({ department: dept._id }),
          Asset.countDocuments({ department: dept._id }),
        ]);

        return {
          ...dept.toObject(),
          employeeCount,
          assetCount,
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      departments: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department with users and assets
// @route   GET /api/departments/:id
// @access  Private
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'head',
      'name email'
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
        code: 'NOT_FOUND',
      });
    }

    const [users, assets] = await Promise.all([
      User.find({ department: department._id }).select('name email role isActive'),
      Asset.find({ department: department._id }).select(
        'assetTag name category status assignedTo'
      ).populate('assignedTo', 'name'),
    ]);

    res.json({
      success: true,
      department: {
        ...department.toObject(),
        employeeCount: users.length,
        assetCount: assets.length,
        users,
        assets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Admin)
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, head } = req.body;

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name already exists.',
        code: 'DUPLICATE_DEPARTMENT',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description,
      head: head || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Admin)
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, head } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
        code: 'NOT_FOUND',
      });
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin - check integrity first)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res, next) => {
  try {
    const departmentId = req.params.id;

    // Check if any users or assets are tied to this department
    const [userCount, assetCount] = await Promise.all([
      User.countDocuments({ department: departmentId }),
      Asset.countDocuments({ department: departmentId }),
    ]);

    if (userCount > 0 || assetCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${userCount} users and ${assetCount} assets currently assigned to this department. Reassign them first.`,
        code: 'DEPARTMENT_IN_USE',
      });
    }

    await Department.findByIdAndDelete(departmentId);

    res.json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
