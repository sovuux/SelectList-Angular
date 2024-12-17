export type Category = {
  name: string;
  selected: boolean;
  isExpanded: boolean;
  items: Item[];
}

type Item = {
  name: string;
  selected: boolean;
  color: string;
}