// Shared field definitions keep the admin form and public specifications consistent.
export const labels = {
  color: 'Colour / available colours', material: 'Material / fibre', length: 'Length',
  width: 'Width', thickness: 'Thickness', coverage: 'Coverage per box',
  backing: 'Backing', construction: 'Construction', pile: 'Pile height',
  species: 'Wood species', finish: 'Finish / texture', wear_layer: 'Wear layer',
  installation: 'Installation method', rating: 'AC rating', water_resistance: 'Water resistance',
  size: 'Tile / product size', application: 'Recommended use', compatibility: 'Compatible flooring'
};
export const categoryFields = {
  carpet: ['color', 'material', 'length', 'width', 'construction', 'pile', 'backing'],
  'carpet-tiles': ['color', 'material', 'size', 'thickness', 'backing', 'coverage', 'installation'],
  'engineered-hardwood': ['color', 'species', 'length', 'width', 'thickness', 'wear_layer', 'finish', 'coverage', 'installation'],
  'solid-hardwood': ['color', 'species', 'length', 'width', 'thickness', 'finish', 'coverage', 'installation'],
  laminate: ['color', 'length', 'width', 'coverage', 'thickness', 'rating', 'finish', 'water_resistance', 'installation'],
  vinyl: ['color', 'construction', 'length', 'width', 'thickness', 'wear_layer', 'coverage', 'backing', 'installation'],
  tiles: ['color', 'material', 'size', 'thickness', 'finish', 'coverage', 'application'],
  accessories: ['color', 'material', 'size', 'thickness', 'coverage', 'compatibility', 'application']
};
