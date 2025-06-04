import AdvocateGrid from "@/components/AdvocateGrid/AdvocateGrid";

const PAGE_SIZE = 5

export default async function Home() {

  return (
    <main style={{ margin: "24px" }}>
      <h1 className="sr-only">Solace Advocates</h1>

      <AdvocateGrid pageSize={PAGE_SIZE} />
    </main>
  );
}
