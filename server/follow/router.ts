
import type {Request, Response, NextFunction} from 'express';
import express from 'express';
import FollowCollection from './collection';
import * as userValidator from '../user/middleware';
import { constructFollowResponse } from './util';
import * as followValidator from '../follow/middleware';

const router = express.Router();

/**
 * Get all the communities that the current user follows
 *
 * @name GET /api/follows/session
 *
 * @return {FollowResponse[]} - A list of all the current user's follows
 * @throws {403} - If the user is not logged in
 */
 router.get(
    '/session',
    [
      userValidator.isUserLoggedIn
    ],
    async (req: Request, res: Response) => {
        const curUserId = (req.session.userId as string) ?? '';
        const follows = await FollowCollection.findAllFollowsByUserId(curUserId);
        const response = follows.map(constructFollowResponse);
        res.status(200).json(response);
    }
  );

/**
 * Get all listings in communities that the current user follows
 *
 * @name GET /api/follows/listings
 *
 * @return {FreetResponse[]} - A list of all the freets of the current user's followings
 * @throws {403} - If the user is not logged in
 */
 router.get(
    '/listings',
    [
      userValidator.isUserLoggedIn
    ],
    async (req: Request, res: Response) => {
        const curUserId = (req.session.userId as string) ?? '';
        const follows = await FollowCollection.findAllFollowsByUserId(curUserId);
        const communityNames = await follows.map(follow => follow.communityName);
        // const listings = await ListingsCollection.findAllListingsByCommunity(communityNames);
        // const response = listings.map(listingUtil.constructListingResponse);
        // res.status(200).json(response);
    }
  );

/**
 * Follow a community
 *
 * @name PUT /api/follows/:communityName
 *
 * @param {string} username - The username of the user to follow
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 * @throws {400} - If `username` is not a recognized username of any user
 * @throws {409} - If the user tries to follow a community they already follow
 */
 router.put(
    '/:communityName?',
    [
      userValidator.isUserLoggedIn,
      followValidator.isRepeatFollow,
      followValidator.isValidCommunityName
    ],
    async (req: Request, res: Response) => {
      const curUserId = (req.session.userId as string) ?? '';
      const communityName = req.params.communityName;
      await FollowCollection.addOne(curUserId, communityName);
      res.status(200).json({
        message: 'Your follow was added successfully.'
      });
    }
  );

/**
 * Delete a follow
 *
 * @name DELETE /api/follows/:communityName
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 * @throws {404} - If there is no follow between current user and username 
 */
 router.delete(
    '/:communityName?',
    [
        userValidator.isUserLoggedIn,
        followValidator.isValidCommunityName
    ],
    async (req: Request, res: Response) => {
      const currUser = (req.session.userId as string) ?? '';
      const communityName = (req.params.communityName);
      await FollowCollection.deleteOne(currUser, communityName);
      res.status(200).json({
        message: 'Your follow was deleted successfully.'
      });
    }
  );
    
  export {router as followRouter};