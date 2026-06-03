import JobRepository from "../repositories/JobRepository.js";
import User_JobRepository from '../repositories/User_JobRepository.js';
import User_JobScoreRepository from '../repositories/User_JobScoreRepository.js';
import { Recommendation } from './recommendation.js';

export const recommended_vacancy = async (userId, profile) => {
    // START - Profile to be compared
    const technologies = profile.technologies ? profile.technologies.split(";") : [];
    const scholarity = [profile.scholarity];
    const languages = profile.languages ? profile.languages.split(";") : [];
    const knowledges = profile.knowledge ? profile.knowledge.split(";") : [];

    let arr_content = [];
    arr_content = arr_content.concat(technologies);
    arr_content = arr_content.concat(scholarity);
    arr_content = arr_content.concat(languages);
    arr_content = arr_content.concat(knowledges);
    const content = arr_content.toString();
    //END - Getting profile

    const createdAndAppliedJobs = new Set();
    let createdJobsByUser = await User_JobRepository.getJobsByUserId(userId, true);
    createdJobsByUser = createdJobsByUser.rows;
    let appliedJobsByUser = await User_JobRepository.getJobsByUserId(userId, false);
    appliedJobsByUser = appliedJobsByUser.rows;

    // id's dos jobs aplicados
    appliedJobsByUser.forEach(element => {
        const id = element.jobId;
        createdAndAppliedJobs.add(id);
    });
    // id's dos jobs criados
    createdJobsByUser.forEach(element => {
        const id = element.jobId;
        createdAndAppliedJobs.add(id);
    });

    let lista = Array.from(createdAndAppliedJobs);
    let jobs = await JobRepository.getOnlyJobsToRecommend(lista);
    let training_array = [];

    jobs.forEach(element => {
        const id = (element.id).toString();
        const job_content = element.description + " "
            + element.scholarity + " "
            + element.title;
        const filtro = arr_content.filter(value => job_content.includes(value));
        if (filtro.length > 0) {
            training_array.push({ "id": id, "content": job_content });
        }
    });

    const recommender = new Recommendation(training_array, content, 10);
    const bestJobs = recommender.get_recommendation();
    const newBestJobs = await returnAdjustedBestJobs(bestJobs, userId);

    return newBestJobs;
};

export const returnAdjustedBestJobs = async (list, userId) => {
    return Promise.all(
        list.map(async item => {
            // Verifica status do score usando o repositório
            const scoreInfo = await User_JobScoreRepository.getUser_JobScoreStatus(userId, item.id);
            const status = scoreInfo ? scoreInfo.status : null;

            if (!status) {
                const newUser_JobScore = await User_JobScoreRepository.createUser_JobScore(userId, item.id, 'none');
                if (!newUser_JobScore) {
                    throw new Error('Falha ao realizar operação.');
                }
            }
            else if (status === 'dislike') {
                item.score = item.score * 0.8;
            }
            else if (status === 'like') {
                item.score = item.score * 1.2;
            }
        })
    ).then(() => {
        return list.sort((a, b) => (a.score < b.score) ? 1 : -1);
    });
};
