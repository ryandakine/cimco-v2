// Rust seed script for CIMCO Inventory System v2
// Run with: cargo run --bin seed

use std::sync::Arc;

use cimco_inventory_v2::auth::service::AuthService;
use cimco_inventory_v2::config::Config;
use cimco_inventory_v2::db::DbPool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    println!("🌱 Seeding CIMCO Inventory Database...");

    // Load configuration
    let config = Config::from_env()?;

    // Create database pool
    let pool = DbPool::new(&config).await?;
    let pool = Arc::new(pool);

    // Create admin user
    println!("Creating admin user...");
    match AuthService::create_user(
        pool.get(),
        "admin",
        "admin123",
        &cimco_inventory_v2::auth::model::UserRole::Admin,
    )
    .await
    {
        Ok(_) => println!("✅ Admin user created successfully"),
        Err(e) => println!("⚠️  Admin user may already exist: {}", e),
    }

    // Create worker user
    println!("Creating worker user...");
    match AuthService::create_user(
        pool.get(),
        "worker",
        "worker123",
        &cimco_inventory_v2::auth::model::UserRole::Worker,
    )
    .await
    {
        Ok(_) => println!("✅ Worker user created successfully"),
        Err(e) => println!("⚠️  Worker user may already exist: {}", e),
    }

    // Insert sample parts
    println!("Creating sample parts...");
    let parts = vec![
        (
            "Hydraulic Cylinder",
            "Main hydraulic cylinder for press operation",
            "Hydraulics",
            "Parker",
            "HC-5000-XL",
            5,
            2,
        ),
        (
            "Control Valve Assembly",
            "Proportional control valve",
            "Hydraulics",
            "Bosch Rexroth",
            "4WRPEH-6-C3",
            12,
            3,
        ),
        (
            "PLC Module CPU",
            "Central processing unit",
            "Electronics",
            "Siemens",
            "S7-1500",
            3,
            1,
        ),
        (
            "Proximity Sensor",
            "Inductive proximity sensor",
            "Sensors",
            "IFM",
            "IGT205",
            45,
            10,
        ),
        (
            "Bearing SKF 6205",
            "Deep groove ball bearing",
            "Mechanical",
            "SKF",
            "6205-2RS1",
            25,
            5,
        ),
        (
            "Conveyor Belt 1200mm",
            "Rubber conveyor belt",
            "Mechanical",
            "Habasit",
            "CB-1200",
            2,
            1,
        ),
        (
            "Pneumatic Cylinder",
            "Compact pneumatic cylinder",
            "Pneumatics",
            "Festo",
            "DSNU-50",
            8,
            3,
        ),
        (
            "Solenoid Valve 5/2",
            "5/2 way solenoid valve",
            "Pneumatics",
            "SMC",
            "SY5120",
            15,
            5,
        ),
        (
            "HMI Touch Panel",
            "10-inch touch screen",
            "Electronics",
            "Siemens",
            "KTP1000",
            4,
            2,
        ),
        (
            "Emergency Stop Button",
            "Mushroom head E-stop",
            "Safety",
            "Schneider",
            "XB4BS8442",
            10,
            4,
        ),
    ];

    for (name, desc, category, manufacturer, part_number, qty, min_qty) in parts {
        let result = sqlx::query(
            r#"
            INSERT INTO parts (name, description, category, manufacturer, part_number, quantity, min_quantity)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
            "#,
        )
        .bind(name)
        .bind(desc)
        .bind(category)
        .bind(manufacturer)
        .bind(part_number)
        .bind(qty)
        .bind(min_qty)
        .execute(pool.get())
        .await;

        match result {
            Ok(_) => println!("  ✅ {}", name),
            Err(e) => println!("  ⚠️  {}: {}", name, e),
        }
    }

    println!("\n🎉 Seeding complete!");
    println!("\nLogin credentials:");
    println!("  Admin:  username='admin', password='admin123'");
    println!("  Worker: username='worker', password='worker123'");

    Ok(())
}
