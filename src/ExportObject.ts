export default interface ExportObject {
  size: string;
  cards: ExportCardData[];
}

interface ExportCardData {
  front: string;
  reverse: string;
  num: number;
}