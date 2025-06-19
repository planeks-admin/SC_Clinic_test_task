import type React from "react"

interface Props {
  title: string
  onChange: (value: string) => void
}

const SearchBar: React.FC<Props> = ({ title, onChange }) => (
  <input
    type="text"
    className="form-control mb-3"
    placeholder="Search by title..."
    style={{ padding: "5px" }}
    value={title}
    onChange={(e) => onChange(e.target.value)}
  />
)

export default SearchBar
