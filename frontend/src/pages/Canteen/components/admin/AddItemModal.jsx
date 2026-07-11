    import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle } from "lucide-react";
import { OriginButton } from "@/components/ui/origin-button";

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
            initial={{ scale: .9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: .9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              width: 450,
              background: '#ffffff',
              borderRadius: 20,
              padding: 28,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
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
                  color: '#0f172a',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                }}
              >
                <PlusCircle />
                Add Menu Item
              </h2>

              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
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
                color: '#0f172a',
                display: 'flex',
                gap: 10,
                marginTop: 15,
                fontSize: '0.875rem',
                fontWeight: 500,
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

            <OriginButton
              onClick={submit}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
            >
              Add Item
            </OriginButton>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}