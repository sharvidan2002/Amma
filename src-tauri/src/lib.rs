pub mod commands;
pub mod database;
pub mod models;

// Use specific exports instead of glob exports to avoid naming conflicts
pub use database::{Collections, connection::init_database, helpers::*};

// Re-export all model types
pub use models::*;

// Define AppState here so it can be used by all modules
#[derive(Debug)]
pub struct AppState {
    pub db: mongodb::Database,
}