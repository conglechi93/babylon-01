# Báo cáo tính năng dự án — 3D Interactive Scene Viewer

**Ngày:** 05/03/2026
**Dự án:** babylon-01

---

## 1. Tổng quan

Dự án là một ứng dụng web 3D tương tác cho phép người dùng quan sát và khám phá hai không gian 3D song song trong cùng một màn hình:

- **Primitive Mesh Showcase** — trưng bày các hình khối 3D cơ bản với animation
- **Solar System Simulation** — mô phỏng hệ Mặt Trời với chuyển động quỹ đạo

Người dùng có thể click vào bất kỳ đối tượng nào để xem thông tin chi tiết trên side panel.

---

## 2. Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Frontend Framework | React | 19 |
| Language | TypeScript | 5.9 |
| 3D Engine | BabylonJS | 8.53 |
| Build Tool | Vite | 7 |
| Node.js | — | ≥ 22 |

---

## 3. Tính năng đã hoàn thành

### 3.1 Môi trường 3D

- **Camera ArcRotate** — xoay, kéo, zoom tự do (giới hạn zoom 5–100 units, có inertia mượt mà)
- **Lighting** — đèn Hemispheric cung cấp ánh sáng môi trường toàn scene
- **Ground plane** — mặt nền tối, không pickable, tạo cảm giác không gian

### 3.2 Primitive Mesh Showcase (khu vực bên trái)

7 hình khối 3D với màu sắc và animation riêng biệt:

| Mesh | Màu | Animation |
|---|---|---|
| Box | Xanh dương nhạt | Xoay Y + xoay X |
| Sphere | Xanh lá | Bob lên xuống |
| Cylinder | Tím | Xoay Y |
| Torus | Hồng | Xoay X + xoay Y |
| Capsule | Cam | Bob + xoay Y |
| Cone | Đỏ nhạt | Xoay Y + xoay Z |
| Disc | Xanh ngọc | Xoay Z + bob |

Animation chạy theo **delta time** — mượt mà, không phụ thuộc frame rate.

### 3.3 Solar System Simulation (khu vực bên phải)

Mô phỏng hệ Mặt Trời với 10 thiên thể:

| Thiên thể | Loại | Đặc điểm |
|---|---|---|
| Sun | Star | Trung tâm, bán kính lớn nhất |
| Mercury | Planet | Quỹ đạo nhanh nhất |
| Venus | Planet | — |
| Earth | Planet | Có Moon quay quanh |
| Moon | Moon | Quỹ đạo quanh Earth |
| Mars | Planet | — |
| Jupiter | Planet | Lớn nhất trong các planet |
| Saturn | Planet | Có ring system |
| Uranus | Planet | — |
| Neptune | Planet | Quỹ đạo chậm nhất |

- Mỗi planet quay quanh Mặt Trời với tốc độ và bán kính quỹ đạo riêng
- Moon quay quanh Earth (parented pivot)
- Saturn có ring system được render riêng

### 3.4 Interaction — Picking & Selection

- **Click vào mesh** → highlight glow trắng + hiển thị thông tin trên side panel
- **Click vùng trống** → bỏ chọn, xóa highlight
- **Phân biệt drag vs click** — kéo camera không bị nhầm thành click chọn mesh
- Hệ thống picking dùng **một onPointerObservable duy nhất**, tránh double-fire

### 3.5 Side Panel — Hiển thị thông tin

Khi chọn Primitive Mesh hiển thị:
- Tên, loại hình (shape), màu sắc
- Kích thước (dimensions)
- Vị trí trong scene (x, y, z)

Khi chọn Celestial Body hiển thị:
- Tên, loại thiên thể (Star / Planet / Moon)
- Đường kính (km)
- Khoảng cách từ Mặt Trời (AU)
- Chu kỳ quỹ đạo (năm)
- Số lượng mặt trăng
- Mô tả

Side panel có thể **thu gọn/mở rộng** để không che khuất scene.

### 3.6 BabylonJS Inspector

- Nút "Show Inspector" trên Toolbar
- Inspector được **lazy-load** — chỉ tải khi người dùng bật, không ảnh hưởng bundle size lúc khởi động

---

## 4. Kiến trúc kỹ thuật

### Tách biệt rõ ràng giữa BabylonJS và React

```
BabylonJS layer          React layer
─────────────────        ──────────────────────
sceneFactory.ts    →     useBabylon.ts (hook)
rayPicking.ts      →     BabylonCanvas.tsx
highlight.ts       →     SelectionProvider (Context)
animations/        →     SidePanel.tsx
```

- BabylonJS không biết về React, React không biết về BabylonJS internals
- Giao tiếp qua callback `onSelect` + React Context

### Ref-forwarding pattern

`useBabylon` dùng `useRef` để giữ callback `onSelect` luôn cập nhật mà không cần tạo lại scene — scene chỉ được khởi tạo **một lần duy nhất**.

### State management

- `SelectionContext` + `SelectionProvider` quản lý selection state toàn app
- `selectedEntity` là derived state tính từ `selectionId` qua `useMemo`

---

## 5. Điểm kỹ thuật nổi bật

| Điểm | Mô tả |
|---|---|
| Delta-time animation | Animation không bị ảnh hưởng bởi frame rate |
| Single picking system | Một observer xử lý cả select lẫn deselect |
| Lazy Inspector | Bundle production không chứa Inspector |
| ResizeObserver | Canvas tự resize khi sidebar collapse/expand |
| Typed metadata | Mọi mesh/celestial đều có type-safe metadata |

---

## 6. Trạng thái dự án

| Hạng mục | Trạng thái |
|---|---|
| Scene 3D cơ bản | ✅ Hoàn thành |
| Primitive meshes + animation | ✅ Hoàn thành |
| Solar system simulation | ✅ Hoàn thành |
| Picking & selection | ✅ Hoàn thành |
| Highlight effect | ✅ Hoàn thành |
| Side panel info | ✅ Hoàn thành |
| React state sync | ✅ Hoàn thành |
| BabylonJS Inspector | ✅ Hoàn thành |
| TypeScript strict | ✅ Hoàn thành |
