import User, { IUser } from "../user/user.model";
import Match from "./match.model";
import {IMatch} from "./match.model";
import favorService from "../favor/favor.service";
import {ObjectId} from "mongoose";


const matchService = {

    getFinishedMatches: async (userId, status): Promise<IMatch[]> => {
        let asUserA: IMatch[] = await Match.find({userA_id: userId, status: status}).exec();
        let asUserB: IMatch[] = await Match.find({userB_id: userId, status: status}).exec();
        let matches = [];
        for(let match of asUserA){
          let info: any = JSON.parse(JSON.stringify(await favorService.getFavorInfo(match.userB_id)));
          info.matchId = match._id;
          if(status != 'COMPLETED'){
            info.date = match.date_accepted;
            info.status = match.status;
          }else{ info.date = match.date_completed; }
          matches.push(info);
        }
        for(let match of asUserB){
          let info: any = JSON.parse(JSON.stringify(await favorService.getFavorInfo(match.userA_id)));
          info.matchId = match._id;
          if(status != 'COMPLETED'){
            info.date = match.date_completed;
            info.status = match.status;
          }
          matches.push(info);
        }

        return matches;
    },

    finishMatch: async(userId: ObjectId, matchId: ObjectId, comment: string, rating: number) => {
        let match:IMatch = await Match.findById(matchId).exec();
        if(!match) throw new Error("Match doesn't exist");
        if(match.status!='CREATED') throw new Error("It's not possible to finish this match");
    
        if(userId.toString() == match.userA_id.toString() && !match.userA_confirmation){
            match.userA_confirmation = true;
    
            //Poner comentarios, y añadir calificacion al Usuario B
            let userB = await User.findByIdAndUpdate(
                match.userB_id, 
                {$push: {'favor.reviews.comments': comment}, $inc: {'favor.reviews.review_num': 1, 'favor.reviews.review_sum': rating}}, 
                {new: true, useFindAndModify: false}
            );
        }else if(userId.toString() == match.userB_id.toString() && !match.userB_confirmation){
            match.userB_confirmation = true;
    
            //Poner comentarios, y añadir calificacion al Usuario A
            let userA = await User.findByIdAndUpdate(
                match.userA_id, 
                {$push: {'favor.reviews.comments': comment}, $inc: {'favor.reviews.review_num': 1, 'favor.reviews.review_sum': rating}}, 
                {new: true, useFindAndModify: false}
            );
        }else throw new Error("User can't accept Match");
    
        if(match.userA_confirmation && match.userB_confirmation) {
            match.status = "COMPLETED";
            match.date_completed = new Date();
        }
    
        return await match.save();
    },

    rejectMatch: async(userId: ObjectId, matchId: ObjectId) => {
      let match:IMatch = await Match.findById(matchId).exec();
      if(!match) throw new Error("Match doesn't exist");
      if(userId.toString() != match.userA_id.toString() && userId.toString() != match.userB_id.toString()){
        throw new Error("User can't reject Match");
      }
      let result: IMatch = await Match.findByIdAndDelete(matchId).exec();
      if(!result) throw new Error("Match couldn't be deleted");

      return result;
    },

    createMatch: async (userA: IUser, userB: IUser): Promise<IMatch> => {
        let test: IMatch = await Match.findOne({ userA_id: userA._id, userB_id: userB._id }).exec();
        if(!test) test =  await Match.findOne({ userA_id: userB._id, userB_id: userA._id }).exec();
        if(test) return null;

        const data = {
            userA_id: userA._id,
            userB_id: userB._id,
        };

        let match: IMatch = new Match(data);
        const result: IMatch = await match.save();

        if (!result) return null;

        console.log(`Match created: ${result}`);
        return result;
    }
}

export default matchService;
