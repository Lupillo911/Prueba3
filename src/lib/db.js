
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://prueba3-lupillo911.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDYyMjMzMjAsImlkIjoiMjkzNTQ0OGYtNTRiYy00NDkyLWFhYzEtYmNiOGNlNzVjODMyIiwicmlkIjoiMGJlZjczNzctMjgzYS00ZDU4LWIxZDMtZDA2ZDE0N2M3OWEzIn0.rIW4rcrpE8dhURpQJq3bSrdnH1XwbdEBW-CGGxnbEOVlCRPa5Ufl1qyXOlpSkiWe4urrTKcN3si0Y7DG_JYLDA'
});

export const authenticateUser = async (username, password) => {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
      args: [username, password]
    });
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en autenticación:', error);
    throw error;
  }
};

export const getItems = async () => {
  try {
    const result = await client.execute('SELECT * FROM items');
    return result.rows;
  } catch (error) {
    console.error('Error al obtener items:', error);
    throw error;
  }
};

export const createItem = async (name, description) => {
  try {
    const result = await client.execute({
      sql: 'INSERT INTO items (name, description) VALUES (?, ?)',
      args: [name, description]
    });
    return result;
  } catch (error) {
    console.error('Error al crear item:', error);
    throw error;
  }
};

export const updateItem = async (id, name, description) => {
  try {
    const result = await client.execute({
      sql: 'UPDATE items SET name = ?, description = ? WHERE id = ?',
      args: [name, description, id]
    });
    return result;
  } catch (error) {
    console.error('Error al actualizar item:', error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const result = await client.execute({
      sql: 'DELETE FROM items WHERE id = ?',
      args: [id]
    });
    return result;
  } catch (error) {
    console.error('Error al eliminar item:', error);
    throw error;
  }
};
