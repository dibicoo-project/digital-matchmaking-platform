import { buildDiBiCooApp } from './server';

const app = buildDiBiCooApp();

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`DiBiCoo back-end listening on port ${PORT}`);
});
