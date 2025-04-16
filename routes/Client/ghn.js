const express = require('express');
const axios = require('axios');
const router = express.Router();

const SHOP_ID = 3677180;
const PICK_DISTRICT = 1574; // Quận Ninh Kiều, Cần Thơ
const GHN_TOKEN = 'd66cf435-f4ac-11ef-ac14-f2515dcc8e8f';

// ✅ Lấy tỉnh/thành
router.get('/provinces', async (req, res) => {
  try {
    const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
      headers: { Token: GHN_TOKEN }
    });
    res.json(response.data);
  } catch (err) {
    console.error('❌ GHN /provinces error:', err.response?.data || err.message); // 👈 THÊM DÒNG NÀY
    res.status(500).json({
      error: 'Lỗi khi lấy tỉnh/thành!',
      detail: err.response?.data || err.message // 👈 GỬI LỖI CHI TIẾT VỀ FE
    });
  }
});


// ✅ Lấy quận/huyện
router.get('/districts/:provinceId', async (req, res) => {
  try {
    const { provinceId } = req.params;
    const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district`, {
      params: { province_id: provinceId },
      headers: { Token: GHN_TOKEN }
    });
    res.json(response.data);
  } catch (err) {
    console.error('❌ Lỗi proxy GHN:', err.message);
    res.status(500).json({ error: 'Proxy GHN lỗi' });
  }
});

// ✅ Lấy phường/xã
router.get('/wards/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const response = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward',
      { district_id: parseInt(districtId) },
      {
        headers: {
          Token: GHN_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('❌ Lỗi khi lấy xã/phường:', err.message);
    res.status(500).json({ error: 'Proxy GHN - xã/phường lỗi' });
  }
});

// ✅ Lấy danh sách dịch vụ vận chuyển (bắt buộc trước khi tính phí)
router.post('/available-services', async (req, res) => {
  try {
    const { to_district } = req.body;

    if (!to_district) {
      return res.status(400).json({ error: 'to_district là bắt buộc!' });
    }

    const response = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
      {
        shop_id: SHOP_ID,
        from_district: PICK_DISTRICT,
        to_district: parseInt(to_district)
      },
      {
        headers: {
          Token: GHN_TOKEN,
          ShopId: SHOP_ID
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('❌ GHN Available Services Error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'GHN Service Error',
      detail: err.response?.data || err.message
    });
  }
});


// ✅ Tính phí vận chuyển
router.post('/fee', async (req, res) => {
  try {
    const { toDistrictId, wardCode, weight } = req.body;

    console.log("📦 Payload từ FE:", req.body);

    // 👉 Bước 1: Gọi lại available-services để lấy serviceId phù hợp
    const serviceRes = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
      {
        shop_id: SHOP_ID,
        from_district: PICK_DISTRICT,
        to_district: Number(toDistrictId),
      },
      {
        headers: {
          Token: GHN_TOKEN,
          ShopId: SHOP_ID,
        },
      }
    );

    const services = serviceRes.data?.data || [];

    if (!services.length) {
      return res.status(400).json({
        error: 'Không có dịch vụ giao hàng khả dụng cho tuyến này!',
        detail: serviceRes.data,
      });
    }

    // 👉 Ưu tiên chọn dịch vụ GHN Nhanh hoặc đầu tiên
    const selectedService = services.find(s => s.short_name.includes('Nhanh')) || services[0];

    // 👉 Bước 2: Gọi GHN fee với serviceId phù hợp
    const feeRes = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
      {
        from_district_id: PICK_DISTRICT,
        to_district_id: Number(toDistrictId),
        to_ward_code: wardCode,
        service_id: selectedService.service_id,
        weight: Number(weight),
      },
      {
        headers: {
          Token: GHN_TOKEN,
          ShopId: SHOP_ID,
        },
      }
    );

    return res.json(feeRes.data);
  } catch (error) {
    console.error('❌ GHN Fee Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'GHN Fee Error',
      detail: error.response?.data || error.message,
      payload: req.body,
    });
  }
});



module.exports = router;
