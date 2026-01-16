export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_items: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          project_id: string
          stage_id: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          stage_id?: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          stage_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activity_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_templates: {
        Row: {
          created_at: string
          default_agenda_items: Json | null
          description: string | null
          duration_minutes: number
          id: string
          name: string
          project_id: string | null
          stage_key: string | null
        }
        Insert: {
          created_at?: string
          default_agenda_items?: Json | null
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          project_id?: string | null
          stage_key?: string | null
        }
        Update: {
          created_at?: string
          default_agenda_items?: Json | null
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          project_id?: string | null
          stage_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          created_at: string
          document_url: string | null
          expires_at: string | null
          id: string
          project_id: string
          sent_at: string | null
          signed_at: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["agreement_status"]
          title: string
          type: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          project_id: string
          sent_at?: string | null
          signed_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          title: string
          type: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          project_id?: string
          sent_at?: string | null
          signed_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["agreement_status"]
          title?: string
          type?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_items: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          paid_at: string | null
          project_id: string
          stage_id: string | null
          status: Database["public"]["Enums"]["billing_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          project_id: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["billing_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          project_id?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["billing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_access_tokens: {
        Row: {
          blueprint_id: string
          created_at: string | null
          expires_at: string
          id: string
          revoked_at: string | null
          scope: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          blueprint_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          revoked_at?: string | null
          scope: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          blueprint_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          revoked_at?: string | null
          scope?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_access_tokens_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_references: {
        Row: {
          blueprint_id: string
          created_at: string
          filename: string | null
          id: string
          label: string | null
          notes: string | null
          role: string | null
          storage_path: string | null
          type: string
          url: string
        }
        Insert: {
          blueprint_id: string
          created_at?: string
          filename?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          role?: string | null
          storage_path?: string | null
          type: string
          url: string
        }
        Update: {
          blueprint_id?: string
          created_at?: string
          filename?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          role?: string | null
          storage_path?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_references_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprints: {
        Row: {
          business_name: string | null
          created_at: string
          current_step: number
          deliver: Json
          design: Json
          discovery: Json
          dream_intent: string | null
          id: string
          pdf_generated_at: string | null
          pdf_object_path: string | null
          pdf_url: string | null
          refinement: Json
          scope: Json
          session_token: string
          session_token_hash: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_email: string | null
          user_name: string | null
          vision: Json
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          current_step?: number
          deliver?: Json
          design?: Json
          discovery?: Json
          dream_intent?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_object_path?: string | null
          pdf_url?: string | null
          refinement?: Json
          scope?: Json
          session_token?: string
          session_token_hash?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          vision?: Json
        }
        Update: {
          business_name?: string | null
          created_at?: string
          current_step?: number
          deliver?: Json
          design?: Json
          discovery?: Json
          dream_intent?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_object_path?: string | null
          pdf_url?: string | null
          refinement?: Json
          scope?: Json
          session_token?: string
          session_token_hash?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          vision?: Json
        }
        Relationships: []
      }
      brief_prompts: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          options: Json | null
          placeholder: string | null
          required: boolean | null
          section_id: string
          sort_order: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id: string
          sort_order?: number
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id?: string
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_prompts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "brief_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_responses: {
        Row: {
          brief_id: string
          created_at: string
          id: string
          prompt_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          brief_id: string
          created_at?: string
          id?: string
          prompt_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          brief_id?: string
          created_at?: string
          id?: string
          prompt_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brief_responses_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "brief_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_template: boolean | null
          key: string
          project_id: string | null
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          key: string
          project_id?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          key?: string
          project_id?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          approved_at: string | null
          created_at: string
          id: string
          is_locked: boolean | null
          project_id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean | null
          project_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean | null
          project_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_lines: {
        Row: {
          brief_id: string
          created_at: string
          description: string | null
          id: string
          item: string
          quantity: number
          sort_order: number
          unit_cost: number
        }
        Insert: {
          brief_id: string
          created_at?: string
          description?: string | null
          id?: string
          item: string
          quantity?: number
          sort_order?: number
          unit_cost: number
        }
        Update: {
          brief_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item?: string
          quantity?: number
          sort_order?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          category: Database["public"]["Enums"]["contact_category"]
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          project_id: string
          role: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: Database["public"]["Enums"]["contact_category"]
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          project_id: string
          role?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: Database["public"]["Enums"]["contact_category"]
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          project_id?: string
          role?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          milestone_id: string | null
          project_id: string
          sort_order: number
          stage_id: string | null
          status: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          project_id: string
          sort_order?: number
          stage_id?: string | null
          status?: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          sort_order?: number
          stage_id?: string | null
          status?: Database["public"]["Enums"]["deliverable_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          file_size: number | null
          id: string
          project_id: string
          stage_id: string | null
          storage_path: string | null
          title: string
          type: string
          updated_at: string
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          id?: string
          project_id: string
          stage_id?: string | null
          storage_path?: string | null
          title: string
          type: string
          updated_at?: string
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_size?: number | null
          id?: string
          project_id?: string
          stage_id?: string | null
          storage_path?: string | null
          title?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_entries: {
        Row: {
          additional_comments: string | null
          could_improve: string | null
          created_at: string
          id: string
          overall_rating: number | null
          overall_reflection: string | null
          project_id: string
          stage_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          testimonial: string | null
          testimonial_permission: boolean | null
          updated_at: string
          worked_well: string | null
          would_work_again: string | null
        }
        Insert: {
          additional_comments?: string | null
          could_improve?: string | null
          created_at?: string
          id?: string
          overall_rating?: number | null
          overall_reflection?: string | null
          project_id: string
          stage_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          testimonial?: string | null
          testimonial_permission?: boolean | null
          updated_at?: string
          worked_well?: string | null
          would_work_again?: string | null
        }
        Update: {
          additional_comments?: string | null
          could_improve?: string | null
          created_at?: string
          id?: string
          overall_rating?: number | null
          overall_reflection?: string | null
          project_id?: string
          stage_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          testimonial?: string | null
          testimonial_permission?: boolean | null
          updated_at?: string
          worked_well?: string | null
          would_work_again?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_entries_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendees: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          meeting_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          meeting_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          meeting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_records: {
        Row: {
          action_items: Json | null
          created_at: string
          id: string
          meeting_id: string
          notes: string | null
          project_id: string
          recording_url: string | null
          stage_id: string | null
          summary: string | null
          transcript_url: string | null
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          id?: string
          meeting_id: string
          notes?: string | null
          project_id: string
          recording_url?: string | null
          stage_id?: string | null
          summary?: string | null
          transcript_url?: string | null
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          id?: string
          meeting_id?: string
          notes?: string | null
          project_id?: string
          recording_url?: string | null
          stage_id?: string | null
          summary?: string | null
          transcript_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_records_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_records_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda_items: Json | null
          agenda_template_id: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          location: string | null
          meeting_link: string | null
          project_id: string
          stage_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agenda_items?: Json | null
          agenda_template_id?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id: string
          stage_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agenda_items?: Json | null
          agenda_template_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string
          stage_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agenda_template_id_fkey"
            columns: ["agenda_template_id"]
            isOneToOne: false
            referencedRelation: "agenda_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          last_message_at: string | null
          project_id: string
          stage_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          last_message_at?: string | null
          project_id: string
          stage_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          last_message_at?: string | null
          project_id?: string
          stage_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string | null
          sender_name: string | null
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_name?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          sort_order: number
          stage_id: string | null
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          sort_order?: number
          stage_id?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          stage_id?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_memberships: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_memberships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          color: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          project_id: string
          short_name: string
          sort_order: number
          status: Database["public"]["Enums"]["stage_status"]
          template_stage_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          project_id: string
          short_name: string
          sort_order: number
          status?: Database["public"]["Enums"]["stage_status"]
          template_stage_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          project_id?: string
          short_name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["stage_status"]
          template_stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stages_template_stage_id_fkey"
            columns: ["template_stage_id"]
            isOneToOne: false
            referencedRelation: "stage_template_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_stage_id: string | null
          description: string | null
          id: string
          name: string
          stage_template_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stage_id?: string | null
          description?: string | null
          id?: string
          name: string
          stage_template_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stage_id?: string | null
          description?: string | null
          id?: string
          name?: string
          stage_template_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_current_stage"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_stage_template_id_fkey"
            columns: ["stage_template_id"]
            isOneToOne: false
            referencedRelation: "stage_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_template_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          short_name: string
          sort_order: number
          stage_template_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          short_name: string
          sort_order: number
          stage_template_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          short_name?: string
          sort_order?: number
          stage_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_template_stages_stage_template_id_fkey"
            columns: ["stage_template_id"]
            isOneToOne: false
            referencedRelation: "stage_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      create_blueprint: {
        Args: never
        Returns: {
          business_name: string
          created_at: string
          current_step: number
          deliver: Json
          design: Json
          discovery: Json
          dream_intent: string
          id: string
          pdf_url: string
          session_token: string
          status: string
          updated_at: string
          user_email: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_studio_user: { Args: { _user_id: string }; Returns: boolean }
      remap_stage_records: {
        Args: { _new_stage_id: string; _old_stage_id: string }
        Returns: undefined
      }
      switch_project_template: {
        Args: { _new_template_id: string; _project_id: string }
        Returns: Json
      }
    }
    Enums: {
      activity_type:
        | "document"
        | "message"
        | "meeting"
        | "milestone"
        | "billing"
        | "system"
      agreement_status: "draft" | "sent" | "viewed" | "signed" | "expired"
      app_role: "studio" | "client"
      billing_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      contact_category: "client" | "studio" | "supplier"
      deliverable_status:
        | "pending"
        | "in_progress"
        | "review"
        | "approved"
        | "revision"
      document_category:
        | "contract"
        | "invoice"
        | "deliverable"
        | "reference"
        | "other"
      meeting_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rescheduled"
      milestone_status: "pending" | "in_progress" | "completed" | "blocked"
      project_role: "owner" | "manager" | "viewer"
      project_status: "active" | "paused" | "completed" | "archived"
      stage_status: "locked" | "current" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "document",
        "message",
        "meeting",
        "milestone",
        "billing",
        "system",
      ],
      agreement_status: ["draft", "sent", "viewed", "signed", "expired"],
      app_role: ["studio", "client"],
      billing_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      contact_category: ["client", "studio", "supplier"],
      deliverable_status: [
        "pending",
        "in_progress",
        "review",
        "approved",
        "revision",
      ],
      document_category: [
        "contract",
        "invoice",
        "deliverable",
        "reference",
        "other",
      ],
      meeting_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      milestone_status: ["pending", "in_progress", "completed", "blocked"],
      project_role: ["owner", "manager", "viewer"],
      project_status: ["active", "paused", "completed", "archived"],
      stage_status: ["locked", "current", "completed"],
    },
  },
} as const
