const pool = require('../booking/db');

async function fetchMenu(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM menu_items ORDER BY id'
    );

    return res.json({
      success: true,
      menu: result.rows
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  fetchMenu
};