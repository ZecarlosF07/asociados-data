import { useMemo, useState } from 'react'
import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { DOCUMENT_CATALOG_GROUPS } from '../../../utils/documentConstants'
import { debounce } from '../../../utils/helpers'

export function DocumentFilters({ onFilterChange }) {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [typeId, setTypeId] = useState('')

  const emitChange = useMemo(
    () => debounce((filters) => onFilterChange(filters), 300),
    [onFilterChange]
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    emitChange({ search: value, categoryId, typeId })
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    setCategoryId(value)
    onFilterChange({ search, categoryId: value, typeId })
  }

  const handleTypeChange = (e) => {
    const value = e.target.value
    setTypeId(value)
    onFilterChange({ search, categoryId, typeId: value })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar por título o nombre de archivo..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="w-44">
        <CatalogSelect
          groupCode={DOCUMENT_CATALOG_GROUPS.DOCUMENT_CATEGORY}
          value={categoryId}
          onChange={handleCategoryChange}
          name="filter_category"
          placeholder="Categoría..."
        />
      </div>

      <div className="w-44">
        <CatalogSelect
          groupCode={DOCUMENT_CATALOG_GROUPS.DOCUMENT_TYPE}
          value={typeId}
          onChange={handleTypeChange}
          name="filter_type"
          placeholder="Tipo..."
        />
      </div>
    </div>
  )
}
