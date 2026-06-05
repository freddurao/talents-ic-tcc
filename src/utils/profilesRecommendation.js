import ProfileRepository from "../repositories/ProfileRepository.js";
import { Recommendation } from "./recommendation.js";

export const recommended_users_to_job = async (userId, job) => {
    const content = job.description + ' ' + job.title + ' ' + job.scholarity;

    // Adaptado para sintaxe do Prisma (removido Op.not)
    let profiles = await ProfileRepository.getAllProfiles(
        {
            userId: {
                not: userId
            },
            searchable: true
        }
    );

    profiles = profiles.rows;
    let training_array = [];

    profiles.forEach(element => {
        const id = (element.id).toString();
        const profile_content = element.scholarity + " "
            + element.knowledge + " "
            + element.technologies + " "
            + element.languages;
        training_array.push({ "id": id, "content": profile_content });
    });

    const recommender = new Recommendation(training_array, content, 10);
    let result = recommender.get_recommendation();
    result = await get_recommended_profiles(result);
    return result;
};

const get_recommended_profiles = async (recommendation_list) => {
    let ids_list = recommendation_list.map(element => element.id);

    if (ids_list.length === 0) return [];

    // Adaptado para sintaxe do Prisma (removido Op.in)
    let profiles = await ProfileRepository.getAllProfiles(
        {
            id: {
                in: ids_list
            }
        }
    );

    profiles = profiles.rows;
    let dict_profiles = {};
    profiles.forEach(element => {
        dict_profiles[element.id] = element;
    });

    let processed_recomendation_list = [];
    return Promise.all(
        recommendation_list.map(async item => {
            if (dict_profiles[item.id]) {
                processed_recomendation_list.push({ ...dict_profiles[item.id], ...item });
            }
        })
    ).then(() => {
        return processed_recomendation_list;
    });
};
