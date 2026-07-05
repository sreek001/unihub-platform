    import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle } from "lucide-react";

export default function AddItemModal({
  isOpen,
  onClose,
  onAdd,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    prep_time: "",
    available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = () => {

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.prep_time
    ) {
      alert("Please fill all fields.");
      return;
    }

    onAdd({
      ...form,
      price: Number(form.price),
      prep_time: Number(form.prep_time),
    });

    setForm({
      name: "",
      description: "",
      price: "",
      prep_time: "",
      available: true,
    });
  };

  return (
    <AnimatePresence>

      {isOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >

          <motion.div
            initial={{ scale: .9 }}
            animate={{ scale: 1 }}
            exit={{ scale: .9 }}
            style={{
              width: 450,
              background: "#18181b",
              borderRadius: 20,
              padding: 28,
              border: "1px solid #3f3f46",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 25,
              }}
            >

              <h2
                style={{
                  color: "white",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <PlusCircle />
                Add Menu Item
              </h2>

              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X />
              </button>

            </div>

            <input
              placeholder="Item Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="admin-input"
            />

            <textarea
              placeholder="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="admin-input"
            />

            <input
              placeholder="Price"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="admin-input"
            />

            <input
              placeholder="Preparation Time (mins)"
              type="number"
              name="prep_time"
              value={form.prep_time}
              onChange={handleChange}
              className="admin-input"
            />

            <label
              style={{
                color: "white",
                display: "flex",
                gap: 10,
                marginTop: 15,
              }}
            >
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
              />
              Available
            </label>

            <button
              onClick={submit}
              style={{
                width: "100%",
                marginTop: 25,
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: 14,
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Add Item
            </button>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}