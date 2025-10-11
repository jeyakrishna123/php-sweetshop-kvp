import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Banner {
  constructor() {
    this.filePath = path.join(__dirname, '../data/banners.json');
    this.ensureFileExists();
  }

  ensureFileExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  getAllBanners() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading banners:', error);
      return [];
    }
  }

  getActiveBanners() {
    const banners = this.getAllBanners();
    return banners.filter(banner => banner.isActive);
  }

  getBannerById(id) {
    const banners = this.getAllBanners();
    return banners.find(banner => banner._id === id);
  }

  createBanner(bannerData) {
    try {
      const banners = this.getAllBanners();
      const newBanner = {
        _id: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...bannerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      banners.push(newBanner);
      fs.writeFileSync(this.filePath, JSON.stringify(banners, null, 2));
      return newBanner;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  }

  updateBanner(id, updateData) {
    try {
      const banners = this.getAllBanners();
      const index = banners.findIndex(banner => banner._id === id);
      
      if (index === -1) {
        throw new Error('Banner not found');
      }

      banners[index] = {
        ...banners[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(this.filePath, JSON.stringify(banners, null, 2));
      return banners[index];
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  }

  deleteBanner(id) {
    try {
      const banners = this.getAllBanners();
      const banner = banners.find(b => b._id === id);
      
      if (!banner) {
        throw new Error('Banner not found');
      }

      // Delete all image files if they exist
      const imageFields = ['imageUrl', 'mobileImageUrl', 'desktopImageUrl'];
      imageFields.forEach(field => {
        if (banner[field] && banner[field].startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '..', banner[field]);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });

      const filteredBanners = banners.filter(banner => banner._id !== id);
      fs.writeFileSync(this.filePath, JSON.stringify(filteredBanners, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }

  reorderBanners(bannerIds) {
    try {
      const banners = this.getAllBanners();
      const reorderedBanners = [];
      
      bannerIds.forEach(id => {
        const banner = banners.find(b => b._id === id);
        if (banner) {
          reorderedBanners.push(banner);
        }
      });

      // Add any remaining banners that weren't in the reorder list
      banners.forEach(banner => {
        if (!reorderedBanners.find(b => b._id === banner._id)) {
          reorderedBanners.push(banner);
        }
      });

      fs.writeFileSync(this.filePath, JSON.stringify(reorderedBanners, null, 2));
      return reorderedBanners;
    } catch (error) {
      console.error('Error reordering banners:', error);
      throw error;
    }
  }
}

export default new Banner();
