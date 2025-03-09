import AdvocateTable from "@/components/AdvocateTable";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/advocates", {
    cache: "no-store",
  });
  const { data } = await res.json(); // Extract data from response

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <AdvocateTable initialAdvocates={data} />
    </main>
  );
}
