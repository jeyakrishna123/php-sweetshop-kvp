import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Get all hidden sections (Admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hiddenSections = db.getAllHiddenSections();
    res.json({ success: true, hiddenSections });
  } catch (error) {
    console.error('Error fetching hidden sections:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hidden sections' });
  }
});

// Get single hidden section (Admin only)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hiddenSection = db.findHiddenSectionById(req.params.id);
    
    if (!hiddenSection) {
      return res.status(404).json({ success: false, message: 'Hidden section not found' });
    }
    
    res.json({ success: true, hiddenSection });
  } catch (error) {
    console.error('Error fetching hidden section:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hidden section' });
  }
});

// Create new hidden section (Admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { sectionName, sectionType, pagePath, isHidden, reason } = req.body;
    
    if (!sectionName || !sectionType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Section name and type are required' 
      });
    }
    
    const newHiddenSection = db.createHiddenSection({
      sectionName,
      sectionType,
      pagePath: pagePath || 'all',
      isHidden: isHidden || true,
      reason: reason || '',
      hiddenBy: req.user.id,
      hiddenAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Section hidden successfully',
      hiddenSection: newHiddenSection 
    });
  } catch (error) {
    console.error('Error creating hidden section:', error);
    res.status(500).json({ success: false, message: 'Failed to hide section' });
  }
});

// Update hidden section (Admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { isHidden, reason } = req.body;
    
    const updatedHiddenSection = db.updateHiddenSection(req.params.id, {
      isHidden,
      reason,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Hidden section updated successfully',
      hiddenSection: updatedHiddenSection 
    });
  } catch (error) {
    console.error('Error updating hidden section:', error);
    if (error.message === 'Hidden section not found') {
      return res.status(404).json({ success: false, message: 'Hidden section not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update hidden section' });
  }
});

// Delete hidden section (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    db.deleteHiddenSection(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Hidden section deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting hidden section:', error);
    if (error.message === 'Hidden section not found') {
      return res.status(404).json({ success: false, message: 'Hidden section not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete hidden section' });
  }
});

// Toggle section visibility (Admin only)
router.put('/:id/toggle', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hiddenSection = db.findHiddenSectionById(req.params.id);
    
    if (!hiddenSection) {
      return res.status(404).json({ success: false, message: 'Hidden section not found' });
    }
    
    const updatedHiddenSection = db.updateHiddenSection(req.params.id, {
      isHidden: !hiddenSection.isHidden,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: `Section ${updatedHiddenSection.isHidden ? 'hidden' : 'shown'} successfully`,
      hiddenSection: updatedHiddenSection 
    });
  } catch (error) {
    console.error('Error toggling section visibility:', error);
    if (error.message === 'Hidden section not found') {
      return res.status(404).json({ success: false, message: 'Hidden section not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to toggle section visibility' });
  }
});

// Get sections visibility status (Public - for frontend to check)
router.get('/visibility/check', async (req, res) => {
  try {
    const { pagePath, sectionName } = req.query;
    
    if (!pagePath || !sectionName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Page path and section name are required' 
      });
    }
    
    const isHidden = db.isSectionHidden(pagePath, sectionName);
    
    res.json({ 
      success: true, 
      isHidden,
      sectionName,
      pagePath 
    });
  } catch (error) {
    console.error('Error checking section visibility:', error);
    res.status(500).json({ success: false, message: 'Failed to check section visibility' });
  }
});

// Get all visible sections for a page (Public)
router.get('/visibility/page/:pagePath', async (req, res) => {
  try {
    const { pagePath } = req.params;
    const visibleSections = db.getVisibleSectionsForPage(pagePath);
    
    res.json({ 
      success: true, 
      visibleSections,
      pagePath 
    });
  } catch (error) {
    console.error('Error fetching visible sections:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visible sections' });
  }
});

export default router;
