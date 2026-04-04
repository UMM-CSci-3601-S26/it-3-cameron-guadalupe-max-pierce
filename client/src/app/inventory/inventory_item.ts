export interface InventoryItem {
  _id: string;
  name: string;
  type: string;
  desc: string;
  location: string;
  stocked: number;
  pack: number;
}
