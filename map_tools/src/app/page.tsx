import { Grid, GridEditor } from "./map";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-row items-center justify-between p-24">
      <GridEditor />
    </main>
  );
}
