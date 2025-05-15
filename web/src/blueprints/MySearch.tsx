import SearchIcon from '@mui/icons-material/Search'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { SetStateAction } from 'react'
import { MyInput } from './MyInput'

export const MySearch = (props: {
  query?: string
  setQuery: React.Dispatch<SetStateAction<string>>
  open?: boolean
  setOpen?: React.Dispatch<SetStateAction<boolean>>
}) => {
  const { query, setQuery, open, setOpen } = props

  return (
    <div className="items-center flex flex-row flex-1 text-left">
      <MyInput
        label={'Quick Search'}
        value={query}
        onChangeValue={setQuery}
        optional
        hidden={open ? !open : true}
      />
      {!open ? (
        <SearchIcon color="action" onClick={() => setOpen && setOpen(true)} />
      ) : (
        <FilterAltIcon
          color="action"
          onClick={() => setOpen && setOpen(false)}
        />
      )}
    </div>
  )
}
