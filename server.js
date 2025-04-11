const express = require("express");
const app = express();
const cors = require("cors");
const database = require("./_dummy_data");
const bodyparser = require("body-parser");
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(bodyparser.json());

app.post("/", (req, res) => {
  try {
    const {
      brands = [],
      prices = [],
      fuelType = [],
      seatingCapacity = [],
      page = 1,
      limit = 10,
      sort = 1,
    } = req.body;

    let filteredCars = [...database.cars];
    if (sort === 1) {
      filteredCars.sort((a, b) => a.price - b.price);
    } else if (sort === -1) {
      filteredCars.sort((a, b) => b.price - a.price);
    }

    // ✅ Filter by brand
    if (brands && brands.length > 0) {
      const brandArray = brands.map((b) => b?.toLowerCase());
      filteredCars = filteredCars.filter((car) =>
        brandArray.includes(car.make?.toLowerCase())
      );
    }

    if (fuelType && fuelType.length > 0) {
      const brandArray = fuelType.map((b) => b?.toLowerCase());
      filteredCars = filteredCars.filter((car) =>
        brandArray.includes(car.fuelType?.toLowerCase())
      );
    }

    if (seatingCapacity && seatingCapacity.length > 0) {
      filteredCars = filteredCars.filter((car) =>
        seatingCapacity.includes(car.seatingCapacity)
      );
    }

    // ✅ Filter by price ranges
    if (prices.length > 0) {
      filteredCars = filteredCars.filter((car) =>
        prices.some((range) => {
          return car.price >= range?.min && car.price <= range?.max;
        })
      );
    }

    // ✅ Pagination logic (correct)
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;

    const paginatedCars = filteredCars.slice(startIndex, endIndex);

    // ✅ Final Response
    res.json({
      totalItems: filteredCars.length,
      totalPages: Math.ceil(filteredCars.length / limitInt),
      currentPage: pageInt,
      items: paginatedCars,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "something went wrong!",
    });
  }
});

app.get("/search", (req, res) => {
  try {
    const { search = "" } = req.query; // use query instead of body for GET requests

    if (!search) {
      return res.json({ items: [] });
    }

    const keyword = search.toLowerCase();
    const regex = new RegExp(keyword, "i"); // case-insensitive regex

    const matchedCars = database.cars.filter((car) => {
      return (
        regex.test(car.make) ||
        regex.test(car.model) ||
        car.features.find((feature) => regex.test(feature))
      );
    });

    res.json({
      totalItems: matchedCars.length,
      items: matchedCars,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "something went wrong!",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
