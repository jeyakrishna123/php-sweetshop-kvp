import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Get all team members
router.get('/', async (req, res) => {
  try {
    const teamMembers = db.getAllTeamMembers();
    res.json({ success: true, teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team members' });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = db.findTeamMemberById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    
    res.json({ success: true, teamMember });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team member' });
  }
});

// Create new team member (Admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, position, bio, image, socialLinks, order } = req.body;
    
    if (!name || !position) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and position are required' 
      });
    }
    
    const teamMembers = db.getAllTeamMembers();
    const newTeamMember = db.createTeamMember({
      name,
      position,
      bio: bio || '',
      image: image || '',
      socialLinks: socialLinks || {},
      order: order || teamMembers.length + 1,
      isActive: true
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Team member created successfully',
      teamMember: newTeamMember 
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, message: 'Failed to create team member' });
  }
});

// Update team member (Admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, position, bio, image, socialLinks, order, isActive } = req.body;
    
    const updatedMember = db.updateTeamMember(req.params.id, {
      name,
      position,
      bio,
      image,
      socialLinks,
      order,
      isActive
    });
    
    res.json({ 
      success: true, 
      message: 'Team member updated successfully',
      teamMember: updatedMember 
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    if (error.message === 'Team member not found') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update team member' });
  }
});

// Delete team member (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    db.deleteTeamMember(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Team member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    if (error.message === 'Team member not found') {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete team member' });
  }
});

// Reorder team members (Admin only)
router.put('/reorder', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { teamMemberIds } = req.body;
    
    if (!Array.isArray(teamMemberIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'teamMemberIds must be an array' 
      });
    }
    
    const teamMembers = db.getAllTeamMembers();
    
    teamMemberIds.forEach((id, index) => {
      const member = teamMembers.find(m => m.id === id);
      if (member) {
        db.updateTeamMember(id, { order: index + 1 });
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Team members reordered successfully' 
    });
  } catch (error) {
    console.error('Error reordering team members:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder team members' });
  }
});

export default router;
