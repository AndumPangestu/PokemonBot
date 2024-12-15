const axios = require('axios');
const stringSimilarity = require('string-similarity');
const { logger } = require('../../infrastructure/logger');
const { PokemonRepository } = require('../repositories/pokemonRepository');

const pokemonRepository = new PokemonRepository();

async function searchPokemon(message) {
  try {
    const pokemonResult = await searchByName(message);
    if (pokemonResult) return pokemonResult;

    const typeResult = await searchByType(message);
    if (typeResult) return typeResult;

    const abilityResult = await searchByAbility(message);
    if (abilityResult) return abilityResult;

    matchMessage = message.match(/(\w+)\s*([><]=|[><=])\s*(\d+)/);

    if (matchMessage) {

      const [fullMatch, stat, operator, value] = matchMessage;

      const statResult = await searchByStat(stat, operator, Number(value));
      if (statResult) return statResult;
    };


    const similarResult = await searchSimilarPokemon(message);
    if (similarResult) return similarResult;


  } catch (error) {
    logger.error('Error searching Pokemon:', error);
    throw error;
  }
}

async function searchSimilarPokemon(name) {
  try {

    const allPokemon = await pokemonRepository.getAllPokemonNames();
    const pokemonMatches = stringSimilarity.findBestMatch(name, allPokemon);

    const filteredResults = await pokemonRepository.getSimilarityPokemon(pokemonMatches, "", "pokemon");
    if (filteredResults) return filteredResults;


    const allTypes = await pokemonRepository.getAllTypes();
    const typeMatches = stringSimilarity.findBestMatch(name, allTypes);

    const filteredTypes = await pokemonRepository.getSimilarityPokemon(typeMatches, "", "type");
    if (filteredTypes) return filteredTypes;


    const allAbilities = await pokemonRepository.getAllAbilities();
    const abilityMatches = stringSimilarity.findBestMatch(name, allAbilities);

    const filteredAbilities = await pokemonRepository.getSimilarityPokemon(abilityMatches, "", "ability");
    if (filteredAbilities) return filteredAbilities;


    return null;


  } catch (error) {
    logger.error('Error searching similar Pokemon:', error);
    throw error;
  }
}

async function searchByName(name) {
  try {
    const pokemon = await pokemonRepository.findByName(name);
    if (pokemon) return pokemon;

    // If no exact match, try finding similar names
    const allPokemon = await pokemonRepository.getAllPokemonNames();
    const matches = stringSimilarity.findBestMatch(name, allPokemon);

    if (matches.bestMatch.rating > 0.5) {
      return await pokemonRepository.findByName(matches.bestMatch.target);
    }

    return null;
  } catch (error) {
    logger.error('Error in searchByName:', error);
    throw error;
  }
}


async function searchByType(name) {
  try {
    const type = await pokemonRepository.findByType(name);
    if (type) return type;


    // If no exact match, try finding similar names
    const allTypes = await pokemonRepository.getAllTypes();
    const matches = stringSimilarity.findBestMatch(name, allTypes);

    if (matches.bestMatch.rating > 0.5) {
      return await pokemonRepository.findByType(matches.bestMatch.target);
    }

    return null;

  } catch (error) {
    logger.error('Error in searchByType:', error);
    throw error;
  }
}

async function searchByAbility(name) {
  try {
    const ability = await pokemonRepository.findByAbility(name);
    if (ability) return ability;

    // If no exact match, try finding similar names
    const allAbilities = await pokemonRepository.getAllAbilities();
    const matches = stringSimilarity.findBestMatch(name, allAbilities);

    if (matches.bestMatch.rating > 0.5) {
      return await pokemonRepository.findByAbility(matches.bestMatch.target);
    }

    return null;

  } catch (error) {
    logger.error('Error in searchByAbility:', error);
    throw error;
  }
}

async function searchByStat(stat, operator, threshold) {

  try {

    const statResponse = await pokemonRepository.findByStat(stat, operator, threshold);
    if (statResponse) return statResponse;

    const allStatNames = await pokemonRepository.getAllStatNames();
    const matches = stringSimilarity.findBestMatch(stat, allStatNames);

    if (matches.bestMatch.rating > 0.5) {
      return await pokemonRepository.findByStat(matches.bestMatch.target, operator, threshold);
    }

  } catch (error) {
    logger.error('Error in searchByStat:', error);
    throw error;
  }

}




module.exports = { searchPokemon };