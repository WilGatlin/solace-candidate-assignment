import AdvocateGrid from "@/components/AdvocateGrid";

const PAGE_SIZE = 5

export default async function Home() {
  const res = await fetch(`http://localhost:3000/api/advocates?page=1&pageSize=${PAGE_SIZE}`, {
    cache: "no-store",
  });
  const { data } = await res.json(); 

  return (
    <main style={{ margin: "24px" }}>
      <h1 className="sr-only">Solace Advocates</h1>

      <AdvocateGrid initialAdvocates={data} pageSize={PAGE_SIZE} />
    </main>
  );
}
