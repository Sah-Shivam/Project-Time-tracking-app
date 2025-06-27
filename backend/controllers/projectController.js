const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const project = new Project({ title, description, startDate, endDate });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
};

exports.assignUsers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { userIds } = req.body; 
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) return res.status(400).json({ message: 'Some users not found' });

    project.assignedUsers = [...new Set([...project.assignedUsers, ...userIds])];
    await project.save();

    res.status(200).json({ message: 'Users assigned successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Assignment failed', error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const projects = role === 'admin'
      ? await Project.find().populate('assignedUsers', 'name email')
      : await Project.find({ assignedUsers: userId });

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve projects', error: err.message });
  }
};
