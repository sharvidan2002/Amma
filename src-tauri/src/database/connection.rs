use mongodb::{Client, Database, options::ClientOptions};
use std::env;
use anyhow::Result;

/// Initialize database connection
pub async fn init_database() -> Result<Database> {
    // Get MongoDB connection string from environment variable
    let connection_string = env::var("MONGODB_CONNECTION_STRING")
        .unwrap_or_else(|_| {
            // Default connection string for development
            "mongodb+srv://username:password@cluster.mongodb.net/employee_management?retryWrites=true&w=majority".to_string()
        });

    // Parse connection string
    let client_options = ClientOptions::parse(&connection_string).await?;

    // Create MongoDB client
    let client = Client::with_options(client_options)?;

    // Get database name from environment or use default
    let db_name = env::var("MONGODB_DATABASE")
        .unwrap_or_else(|_| "employee_management".to_string());

    // Test connection
    client
        .database("admin")
        .run_command(mongodb::bson::doc! {"ping": 1}, None)
        .await?;

    println!("Connected to MongoDB successfully!");

    // Return database instance
    Ok(client.database(&db_name))
}

/// Get collection names used in the application
pub struct Collections;

impl Collections {
    pub const EMPLOYEES: &'static str = "employees";
    pub const ATTENDANCE: &'static str = "attendance";
    pub const LEAVES: &'static str = "leaves";
}

/// Database helper functions
pub mod helpers {
    use mongodb::bson::{doc, oid::ObjectId};
    use serde::{Deserialize, Serialize};

    /// Convert string ID to ObjectId
    pub fn string_to_object_id(id: &str) -> Result<ObjectId, mongodb::bson::oid::Error> {
        ObjectId::parse_str(id)
    }

    /// Convert ObjectId to string
    pub fn object_id_to_string(id: &ObjectId) -> String {
        id.to_hex()
    }

    /// Create a filter document for finding by ID
    pub fn id_filter(id: &str) -> Result<mongodb::bson::Document, mongodb::bson::oid::Error> {
        let object_id = string_to_object_id(id)?;
        Ok(doc! { "_id": object_id })
    }

    /// Pagination helper
    #[derive(Debug, Serialize, Deserialize)]
    pub struct PaginationOptions {
        pub page: u64,
        pub limit: u64,
        pub sort_by: Option<String>,
        pub sort_order: Option<i32>, // 1 for ascending, -1 for descending
    }

    impl Default for PaginationOptions {
        fn default() -> Self {
            Self {
                page: 1,
                limit: 25,
                sort_by: None,
                sort_order: Some(1),
            }
        }
    }

    impl PaginationOptions {
        pub fn skip(&self) -> u64 {
            (self.page - 1) * self.limit
        }

        pub fn sort_doc(&self) -> mongodb::bson::Document {
            if let Some(ref field) = self.sort_by {
                doc! { field: self.sort_order.unwrap_or(1) }
            } else {
                doc! { "_id": 1 }
            }
        }
    }

    /// Search helper
    #[derive(Debug, Serialize, Deserialize)]
    pub struct SearchOptions {
        pub query: String,
        pub fields: Vec<String>,
        pub case_sensitive: bool,
    }

    impl SearchOptions {
        pub fn to_filter(&self) -> mongodb::bson::Document {
            let mut or_conditions = Vec::new();

            for field in &self.fields {
                let regex = if self.case_sensitive {
                    doc! { "$regex": &self.query }
                } else {
                    doc! { "$regex": &self.query, "$options": "i" }
                };

                or_conditions.push(doc! { field: regex });
            }

            if or_conditions.is_empty() {
                doc! {}
            } else {
                doc! { "$or": or_conditions }
            }
        }
    }
}