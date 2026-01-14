export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          name_fr: string
          name_ar: string
          description_fr: string
          description_ar: string
          logo_url: string
          whatsapp_number: string
          email: string
          status: 'active' | 'inactive'
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
      }
      divisions: {
        Row: {
          id: string
          name: string
          name_fr: string
          name_ar: string
          description_fr: string
          description_ar: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['divisions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['divisions']['Insert']>
      }
      categories: {
        Row: {
          id: string
          division_id: string
          name: string
          name_fr: string
          name_ar: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          brand_id: string
          division_id: string
          category_id: string | null
          reference_code: string
          name_fr: string
          name_ar: string
          description_fr: string
          description_ar: string
          moq: number
          available_quantity: number
          status: 'active' | 'hidden'
          main_image: string
          images: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      clients: {
        Row: {
          id: string
          company_name: string
          country: string
          whatsapp_number: string
          email: string
          contact_person: string
          address: string
          notes: string
          status: 'active' | 'inactive'
          total_orders: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          client_id: string | null
          client_company_name: string
          client_country: string
          client_whatsapp: string
          client_email: string
          items: Json
          notes: string
          internal_notes: string
          status: 'pending' | 'preparing' | 'shipped' | 'completed' | 'cancelled'
          shipping_country: string
          shipping_method: string
          estimated_delivery: string
          tracking_number: string
          delivery_notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          order_id: string
          client_id: string | null
          brand_id: string | null
          items: Json
          subtotal: number
          tax: number
          total: number
          currency: string
          pdf_url: string
          status: 'draft' | 'sent' | 'paid' | 'cancelled'
          sent_at: string | null
          paid_at: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string
          description: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json
          ip_address: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
      }
    }
  }
}

export type Brand = Database['public']['Tables']['brands']['Row'];
export type Division = Database['public']['Tables']['divisions']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
