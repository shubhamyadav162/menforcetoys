// Enhanced shipping address service for NP Wellness Store
import { supabase } from '@/lib/supabase';
import type { ShippingAddressDB, ShippingAddressInsert } from '@/types/database';
import type { ShippingAddressForm } from '@/utils/formValidation';

export class ShippingAddressService {
  // Create a new shipping address
  static async createShippingAddress(
    userId: string,
    formData: ShippingAddressForm,
    isDefault: boolean = false
  ) {
    try {
      // If setting as default, unset other default addresses first
      if (isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const addressData: ShippingAddressInsert = {
        user_id: userId,
        address_type: 'shipping',
        full_name: formData.fullName,
        phone: formData.phone,
        address_line_1: formData.address,
        address_line_2: formData.addressLine2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India',
        is_default: isDefault
      };

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert([addressData])
        .select()
        .single();

      if (error) {
        console.error('Error creating shipping address:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Shipping address creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create shipping address' 
      };
    }
  }

  // Get all shipping addresses for a user
  static async getShippingAddresses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('address_type', 'shipping')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shipping addresses:', error);
        throw new Error(error.message);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Fetch shipping addresses error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch shipping addresses' 
      };
    }
  }

  // Get default shipping address for a user
  static async getDefaultShippingAddress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('address_type', 'shipping')
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching default shipping address:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fetch default shipping address error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch default shipping address' 
      };
    }
  }

  // Update a shipping address
  static async updateShippingAddress(
    addressId: string,
    userId: string,
    formData: ShippingAddressForm,
    isDefault: boolean = false
  ) {
    try {
      // If setting as default, unset other default addresses first
      if (isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const updateData: Partial<ShippingAddressInsert> = {
        full_name: formData.fullName,
        phone: formData.phone,
        address_line_1: formData.address,
        address_line_2: formData.addressLine2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        is_default: isDefault
      };

      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(updateData)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shipping address:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Shipping address update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update shipping address' 
      };
    }
  }

  // Set an address as default
  static async setDefaultAddress(addressId: string, userId: string) {
    try {
      // First, unset all default addresses for this user
      await this.unsetDefaultAddresses(userId);

      // Then set the specified address as default
      const { data, error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error setting default address:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Set default address error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set default address' 
      };
    }
  }

  // Delete a shipping address
  static async deleteShippingAddress(addressId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting shipping address:', error);
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Shipping address deletion error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete shipping address' 
      };
    }
  }

  // Helper method to unset all default addresses for a user
  private static async unsetDefaultAddresses(userId: string) {
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      if (error) {
        console.error('Error unsetting default addresses:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Unset default addresses error:', error);
      throw error;
    }
  }

  // Validate PIN code (could integrate with external API)
  static async validatePincode(pincode: string) {
    try {
      // Basic validation - in production, you might want to integrate with a PIN code validation API
      const pincodeRegex = /^[1-9]\d{5}$/;
      if (!pincodeRegex.test(pincode)) {
        return { 
          success: false, 
          error: 'Invalid PIN code format' 
        };
      }

      // For now, just return success - in production, you could validate against a database
      // of valid Indian pincodes or use an external API
      return { 
        success: true, 
        data: { 
          city: 'Validated', // Would come from API
          state: 'Validated', // Would come from API
          isServiceable: true 
        } 
      };
    } catch (error) {
      console.error('PIN code validation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'PIN code validation failed' 
      };
    }
  }

  // Get address by ID
  static async getAddressById(addressId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching address:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fetch address error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch address' 
      };
    }
  }
}

// Real-time subscription for shipping address changes
export const subscribeToShippingAddresses = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('shipping_addresses_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shipping_addresses',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};