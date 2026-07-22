# Render Awake

หน้า `/:name` จะ fetch ไปยัง `https://[name].onrender.com/` โดยตรง และ redirect เมื่อ request ตอบกลับ

```bash
pnpm install
pnpm test
pnpm build
pnpm preview:pages
```

Cloudflare Pages Git settings:

- Build command: `pnpm build`
- Build output: `dist`
- Root directory: `/`

Deploy จากเครื่องด้วย `pnpm deploy` หรืออัปโหลด `dist` ผ่าน Dashboard ได้โดยตรง
