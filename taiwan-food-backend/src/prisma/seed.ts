import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // Đọc file JSON
  const filePath = path.join(__dirname, "../data/taiwan_restaurants.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const restaurants = JSON.parse(rawData);

  console.log(`Đang thêm ${restaurants.length} nhà hàng vào Database...`);

  // Duyệt và thêm vào bảng
  for (const item of restaurants) {
    await prisma.restaurant.upsert({
      where: { placeId: item.placeId },
      update: {}, // Nếu có rồi thì bỏ qua
      create: item, // Nếu chưa có thì thêm mới
    });
  }

  console.log("✅ Import dữ liệu JSON thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
