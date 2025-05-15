export interface ITransaction {
  description: string;
  amount: number;
  creditAcct: number;
  debitAcct: number;
}

export interface Option {
  id: number;
  name: string
}

export type Page = {
  title: string
  link?: string
  selected: boolean
  onClick?: () => void
  hidden?: boolean
}

export type Field = {
  name: string
  label: string
  type: string
  options?: Option[]
  centered?: boolean
  infoType?: string
}

export type MySpeedDialProps = {
  icon: any
  name: string
  onClick?: () => void
  hidden?: boolean
}
