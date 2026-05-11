import Container from "@/components/container";

export default function ManagementPage() {
  return (
    <div className="py-6">
      <Container>
        <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
        <p className="text-slate-500">Add, update, or remove SKUs and adjust stock levels across all channels.</p>
      </Container>
    </div>
  );
}
