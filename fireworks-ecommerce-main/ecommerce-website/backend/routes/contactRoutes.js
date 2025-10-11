import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Get all contact submissions (Admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const contacts = db.getAllContacts();
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Get single contact submission (Admin only)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const contact = db.findContactById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    
    res.json({ success: true, contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact' });
  }
});

// Create new contact submission (Public)
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, subject, and message are required' 
      });
    }
    
    const newContact = db.createContact({
      fullName,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'new',
      isRead: false
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      contact: newContact 
    });
  } catch (error) {
    console.error('Error creating contact submission:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

// Update contact status (Admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, isRead, adminNotes } = req.body;
    
    const updatedContact = db.updateContact(req.params.id, {
      status,
      isRead,
      adminNotes
    });
    
    res.json({ 
      success: true, 
      message: 'Contact updated successfully',
      contact: updatedContact 
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.message === 'Contact not found') {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

// Delete contact submission (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    db.deleteContact(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Contact submission deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    if (error.message === 'Contact not found') {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
});

// Mark contact as read (Admin only)
router.put('/:id/read', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const updatedContact = db.updateContact(req.params.id, { isRead: true });
    
    res.json({ 
      success: true, 
      message: 'Contact marked as read',
      contact: updatedContact 
    });
  } catch (error) {
    console.error('Error marking contact as read:', error);
    if (error.message === 'Contact not found') {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to mark contact as read' });
  }
});

// Get contact statistics (Admin only)
router.get('/stats/overview', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const contacts = db.getAllContacts();
    
    const stats = {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      read: contacts.filter(c => c.isRead).length,
      unread: contacts.filter(c => !c.isRead).length,
      responded: contacts.filter(c => c.status === 'responded').length,
      closed: contacts.filter(c => c.status === 'closed').length
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact statistics' });
  }
});

export default router;
