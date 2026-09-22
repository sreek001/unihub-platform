const db = require('./db');

const defaultMenu = [
  { id: 1, name: 'Veg Meal', description: 'Rice, curry and side dishes', price: 50, stock: 25, prep_time: 5, available: true, image_url: '' },
  { id: 2, name: 'Chicken Roll', description: 'Freshly prepared chicken roll', price: 45, stock: 20, prep_time: 3, available: true, image_url: '' },
  { id: 3, name: 'Masala Dosa', description: 'South Indian breakfast item', price: 40, stock: 15, prep_time: 4, available: true, image_url: '' },
  { id: 4, name: 'Cold Coffee', description: 'Chilled coffee beverage', price: 35, stock: 30, prep_time: 2, available: true, image_url: '' },
  { id: 5, name: 'Fresh Lime', description: 'Refreshing lime juice', price: 20, stock: 50, prep_time: 1, available: true, image_url: '' }
];

let inMemoryMenu = JSON.parse(JSON.stringify(defaultMenu));
let inMemoryOrders = [];
let nextOrderId = 1;
let nextTokenNumber = 101;

const CanteenModel = {
  // ==========================
  // MENU
  // ==========================
  async getMenu() {
    try {
      const query = `
        SELECT *
        FROM menu_items
        WHERE available = TRUE
        ORDER BY id;
      `;
      const { rows } = await db.query(query);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      // In-memory fallback
    }
    return inMemoryMenu.filter(item => item.available);
  },

  async getMenuItemById(id) {
    try {
      const query = `
        SELECT *
        FROM menu_items
        WHERE id = $1
        LIMIT 1;
      `;
      const { rows } = await db.query(query, [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // In-memory fallback
    }
    return inMemoryMenu.find(item => item.id === Number(id));
  },

  // ==========================
  // ORDER
  // ==========================
  async createOrder(client, userId, totalAmount) {
    if (client) {
      const query = `
        INSERT INTO orders (user_id, total_amount)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const { rows } = await client.query(query, [userId, totalAmount]);
      return rows[0];
    }

    const order = {
      id: nextOrderId++,
      user_id: userId,
      token_number: nextTokenNumber++,
      total_amount: totalAmount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      items: []
    };
    inMemoryOrders.unshift(order);
    return order;
  },

  async createOrderItem(client, orderId, menuItemId, quantity, price) {
    if (client) {
      const query = `
        INSERT INTO order_items (order_id, menu_item_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const { rows } = await client.query(query, [orderId, menuItemId, quantity, price]);
      return rows[0];
    }

    const targetOrder = inMemoryOrders.find(o => o.id === orderId);
    const m = inMemoryMenu.find(item => item.id === Number(menuItemId));
    if (targetOrder) {
      targetOrder.items.push({
        menuItemId,
        name: m ? m.name : 'Item',
        quantity,
        price
      });
    }
    if (m) {
      m.stock = Math.max(0, m.stock - quantity);
    }
    return { order_id: orderId, menu_item_id: menuItemId, quantity, price };
  },

  // ==========================
  // ORDERS LIST / STATUS
  // ==========================
  async getAllOrders() {
    try {
      const query = `
        SELECT
            o.id,
            o.token_number,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            json_agg(
                json_build_object(
                    'menuItemId', oi.menu_item_id,
                    'name', m.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            ) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items m ON oi.menu_item_id = m.id
        GROUP BY o.id
        ORDER BY o.created_at DESC;
      `;
      const { rows } = await db.query(query);
      if (rows) return rows;
    } catch (e) {
      // In-memory fallback
    }
    return inMemoryOrders;
  },

  async getOrderById(id) {
    try {
      const query = `
        SELECT
            o.*,
            json_agg(
                json_build_object(
                    'menuItemId', oi.menu_item_id,
                    'name', m.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            ) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE o.id = $1
        GROUP BY o.id;
      `;
      const { rows } = await db.query(query, [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // In-memory fallback
    }
    return inMemoryOrders.find(o => o.id === Number(id));
  },

  async updateOrderStatus(orderId, status) {
    try {
      const query = `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *;
      `;
      const { rows } = await db.query(query, [status, orderId]);
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // In-memory fallback
    }

    const order = inMemoryOrders.find(o => o.id === Number(orderId));
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  }
};

module.exports = CanteenModel;