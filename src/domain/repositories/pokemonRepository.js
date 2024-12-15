const axios = require('axios');
const { logger } = require('../../infrastructure/logger');

class PokemonRepository {
  constructor() {
    this.baseUrl = 'https://pokeapi.co/api/v2';
    this.cache = new Map();

    setInterval(() => {
      console.log("Resetting cache...");
      this.cache.clear();
    }, 24 * 60 * 60 * 1000);
  }

  async findByName(name) {
    try {
      const cacheKey = `pokemon:${name}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${this.baseUrl}/pokemon/${name}`);
      const pokemon = this._mapPokemonData(response.data);
      this.cache.set(cacheKey, pokemon);

      return pokemon;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      logger.error('Error fetching Pokemon by name:', error);
      throw error;
    }
  }


  async getAllPokemonNames() {
    try {

      const cacheKey = 'allPokemonNames';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${this.baseUrl}/pokemon`);
      const pokemonNames = response.data.results.map(pokemon => pokemon.name);
      this.cache.set(cacheKey, pokemonNames);

      return pokemonNames;

    } catch (error) {
      logger.error('Error fetching all Pokemon names:', error);
      throw error;
    }
  }

  async findByType(type) {
    try {
      const response = await axios.get(`${this.baseUrl}/type/${type}`);
      const typeName = response.data.pokemon.map(pokemon => pokemon.pokemon.name);
      const typePokemon = this._mapListPokemonData(typeName, "type: " + type, "pokemon");
      return typePokemon;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      logger.error('Error fetching Pokemon by type:', error);
      throw error;
    }
  }

  async getAllTypes() {
    try {

      const cacheKey = 'allTypes';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${this.baseUrl}/type`);
      const types = response.data.results.map(type => type.name);
      this.cache.set(cacheKey, types);

      return types;

    } catch (error) {
      logger.error('Error fetching all Pokemon names:', error);
      throw error;
    }
  }



  async findByAbility(ability) {
    try {
      const response = await axios.get(`${this.baseUrl}/ability/${ability}`);
      const abilityName = response.data.pokemon.map(pokemon => pokemon.pokemon.name);
      const abilityNamePokemon = this._mapListPokemonData(abilityName, "ability: " + ability, "pokemon");
      return abilityNamePokemon;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      logger.error('Error fetching Pokemon by ability:', error);
      throw error;
    }
  }

  async getAllAbilities() {
    try {

      const cacheKey = 'allAbilities';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${this.baseUrl}/type`);
      const abilities = response.data.results.map(ability => ability.name);
      this.cache.set(cacheKey, abilities);

      return abilities;

    } catch (error) {
      logger.error('Error fetching all Pokemon names:', error);
      throw error;
    }
  }

  async getAllStatNames() {
    try {

      const cacheKey = 'allStatNames';
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${this.baseUrl}/stat`);
      const statNames = response.data.results.map(stat => stat.name);
      this.cache.set(cacheKey, statNames);

      return statNames;

    } catch (error) {
      logger.error('Error fetching all stat names:', error);
      throw error;
    }
  }

  async findByStat(stat, operator, threshold) {
    try {

      const response = await axios.get(`${this.baseUrl}/pokemon`);

      const statNames = [];
      for (const pokemon of response.data.results) {
        const details = await this.findByName(pokemon.name);
        const statValue = details.stats.find(s => s.name === stat)?.value;
        if (statValue !== undefined && this._compareStat(statValue, operator, threshold)) {
          statNames.push(pokemon.name);
        }
      }

      return statNames.length > 0 ? this._mapListPokemonData(statNames, `stat: ${stat} ${operator} ${threshold}`, "pokemon") : null;
    } catch (error) {
      logger.error('Error fetching Pokemon by stat:', error);
      throw error;
    }
  }


  async getSimilarityPokemon(matches, keyword, dataType) {

    const filteredResults = await matches.ratings
      .filter((match) => match.rating >= 0.25 && match.rating <= 0.5)
      .map((match) => match.target);


    return filteredResults.length > 0 ? this._mapListPokemonData(filteredResults, keyword, dataType, true) : null;
  }



  _compareStat(statValue, operator, threshold) {
    switch (operator) {
      case '>':
        return statValue > threshold;
      case '<':
        return statValue < threshold;
      case '>=':
        return statValue >= threshold;
      case '<=':
        return statValue <= threshold;
      case '=':
      case '==': // Mendukung format `=` atau `==`
        return statValue === threshold;
      default:
        logger.error('Invalid operator:', operator);
        return false;
    }
  }

  _mapPokemonData(data) {
    return {
      type: "detail",
      image: data.sprites.other['official-artwork'].front_default,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      types: data.types.map(type => type.type.name),
      stats: data.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat
      })),
      abilities: data.abilities.map(ability => ability.ability.name)
    };
  }

  _mapListPokemonData(data, keyword, dataType, isNotFound = false) {
    return {
      keyword: keyword,
      dataType: dataType,
      type: "list",
      name: data,
      isNotFound: isNotFound
    }
  }
}

module.exports = { PokemonRepository };