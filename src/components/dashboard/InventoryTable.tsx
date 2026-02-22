import { InventoryItem } from '@/types';

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span className="badge-success">{status}</span>;
      case 'Low Stock':
        return <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-warning text-warning-foreground">{status}</span>;
      case 'Out of Stock':
        return <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-destructive text-destructive-foreground">{status}</span>;
      default:
        return <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-muted text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="card-scroll">
      <table className="table-dashboard">
        <thead>
          <tr>
            <th>Item ID</th>
            <th>Description</th>
            <th>Unit</th>
            <th className="text-right">Stocks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemId} className="animate-fade-in">
              <td className="font-mono text-sm">{item.itemId}</td>
              <td>{item.description}</td>
              <td>{item.unit}</td>
              <td className="text-right font-semibold">{item.totalRunningStocks}</td>
              <td>{getStatusBadge(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
