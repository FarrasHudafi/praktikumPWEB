package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

type Todo struct {
	ID        int    `json:"id,omitempty"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

var db *sql.DB

func main() {
	fmt.Println("hello world")

	if os.Getenv("ENV") != "production" {
		// Load the .env file if not in production
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file:", err)
		}
	}

	// MySQL connection string format: user:password@tcp(host:port)/dbname
	DB_USER := os.Getenv("DB_USER")
	DB_PASSWORD := os.Getenv("DB_PASSWORD")
	DB_HOST := os.Getenv("DB_HOST")
	DB_PORT := os.Getenv("DB_PORT")
	DB_NAME := os.Getenv("DB_NAME")

	if DB_USER == "" {
		DB_USER = "root"
	}
	if DB_PASSWORD == "" {
		DB_PASSWORD = ""
	}
	if DB_HOST == "" {
		DB_HOST = "localhost"
	}
	if DB_PORT == "" {
		DB_PORT = "3306"
	}
	if DB_NAME == "" {
		DB_NAME = "golang_db"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	fmt.Println("Connected to MySQL (XAMPP)")

	// Create todos table if it doesn't exist
	initDatabase()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin,Content-Type,Accept",
	}))

	app.Get("/api/todos", getTodos)
	app.Post("/api/todos", createTodo)
	app.Patch("/api/todos/:id", updateTodo)
	app.Delete("/api/todos/:id", deleteTodo)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	if os.Getenv("ENV") == "production" {
		app.Static("/", "./client/dist")
	}

	log.Fatal(app.Listen("0.0.0.0:" + port))

}

func initDatabase() {
	createTableQuery := `
		CREATE TABLE IF NOT EXISTS todos (
			id INT AUTO_INCREMENT PRIMARY KEY,
			body TEXT NOT NULL,
			completed BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`

	_, err := db.Exec(createTableQuery)
	if err != nil {
		log.Fatal("Error creating todos table:", err)
	}
	fmt.Println("Todos table initialized")
}

func getTodos(c *fiber.Ctx) error {
	var todos []Todo

	rows, err := db.Query("SELECT id, body, completed FROM todos ORDER BY id DESC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching todos"})
	}
	defer rows.Close()

	for rows.Next() {
		var todo Todo
		if err := rows.Scan(&todo.ID, &todo.Body, &todo.Completed); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error scanning todos"})
		}
		todos = append(todos, todo)
	}

	if err = rows.Err(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error iterating todos"})
	}

	return c.JSON(todos)
}

func createTodo(c *fiber.Ctx) error {
	todo := new(Todo)
	// {id:0,completed:false,body:""}

	if err := c.BodyParser(todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Please provide todo"})
	}

	result, err := db.Exec("INSERT INTO todos (body, completed) VALUES (?, ?)", todo.Body, todo.Completed)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creating todo"})
	}

	id, err := result.LastInsertId()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error getting todo ID"})
	}

	todo.ID = int(id)

	return c.Status(201).JSON(todo)
}

func updateTodo(c *fiber.Ctx) error {
	id := c.Params("id")

	// Parse request body to get update fields
	var updateData map[string]interface{}
	if err := c.BodyParser(&updateData); err != nil {
		// If no body is provided, default to toggling completed status
		// This maintains backward compatibility
		var currentTodo Todo
		err := db.QueryRow("SELECT completed FROM todos WHERE id = ?", id).Scan(&currentTodo.Completed)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
		}

		_, err = db.Exec("UPDATE todos SET completed = ? WHERE id = ?", !currentTodo.Completed, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error updating todo"})
		}
	} else {
		// Build dynamic update query based on provided fields
		var updates []string
		var args []interface{}

		if body, ok := updateData["body"].(string); ok && body != "" {
			updates = append(updates, "body = ?")
			args = append(args, body)
		}

		if completed, ok := updateData["completed"].(bool); ok {
			updates = append(updates, "completed = ?")
			args = append(args, completed)
		}

		if len(updates) == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "No valid fields to update"})
		}

		args = append(args, id)
		query := "UPDATE todos SET " + fmt.Sprintf("%s", updates[0])
		for i := 1; i < len(updates); i++ {
			query += ", " + updates[i]
		}
		query += " WHERE id = ?"

		_, err := db.Exec(query, args...)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error updating todo"})
		}
	}

	// Fetch and return the updated todo
	var updatedTodo Todo
	err := db.QueryRow("SELECT id, body, completed FROM todos WHERE id = ?", id).Scan(
		&updatedTodo.ID, &updatedTodo.Body, &updatedTodo.Completed)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching updated todo"})
	}

	return c.Status(200).JSON(updatedTodo)
}

func deleteTodo(c *fiber.Ctx) error {
	id := c.Params("id")

	_, err := db.Exec("DELETE FROM todos WHERE id = ?", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error deleting todo"})
	}

	return c.Status(200).JSON(fiber.Map{"success": true})
}
