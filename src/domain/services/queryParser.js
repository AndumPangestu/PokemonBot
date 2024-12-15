function parseQuery(text) {
  // Check for stat comparison query (e.g., "attack > 50")
  const statMatch = text.match(/(\w+)\s*([><=])\s*(\d+)/);
  if (statMatch) {
    return {
      type: 'stat',
      value: statMatch[1],
      threshold: parseInt(statMatch[3])
    };
  }

  // Check for type-based query
  if (text.startsWith('type:')) {
    return {
      type: 'type',
      value: text.split(':')[1].trim()
    };
  }

  // Check for ability-based query
  if (text.startsWith('ability:')) {
    return {
      type: 'ability',
      value: text.split(':')[1].trim()
    };
  }

  // Default to name search
  return {
    type: 'name',
    value: text.trim()
  };
}

module.exports = { parseQuery };