
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";
import Login from "@/components/Login";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/db";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      if (!user) {
        toast({
          title: "Acceso Denegado",
          description: "Por favor inicia sesión para continuar",
          variant: "destructive",
        });
        navigate("/", { state: { from: location.pathname } });
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, location, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

function Dashboard() {
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/");
        return false;
      }
      return true;
    };

    if (checkSession()) {
      loadItems();
    }
  }, [navigate]);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los items",
        variant: "destructive",
      });
      if (error.message?.includes('authentication')) {
        handleLogout();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentItem) {
        await updateItem(currentItem.id, formData.name, formData.description);
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        });
      } else {
        await createItem(formData.name, formData.description);
        toast({
          title: "Éxito",
          description: "Item creado correctamente",
        });
      }
      
      loadItems();
      setIsDialogOpen(false);
      setCurrentItem(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el item",
        variant: "destructive",
      });
      if (error.message?.includes('authentication')) {
        handleLogout();
      }
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({ name: item.name, description: item.description });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      loadItems();
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el item",
        variant: "destructive",
      });
      if (error.message?.includes('authentication')) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setCurrentItem(null);
                setFormData({ name: "", description: "" });
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Nuevo Item
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-lg border bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="mb-4 text-gray-600">{item.description}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentItem ? "Editar Item" : "Nuevo Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">{currentItem ? "Actualizar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
