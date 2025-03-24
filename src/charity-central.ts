// import {
//   CampaignCreated as CampaignCreatedEvent,
//   CharityCentral,
// } from '../generated/CharityCentral/CharityCentral';

// import {
//   DonationReceived as DonationReceivedEvent,
//   CharityCampaign,
// } from '../generated/templates/CharityCampaign/CharityCampaign';

// import { Campaign, Donor, Donation } from '../generated/schema';
// import { BigInt } from '@graphprotocol/graph-ts';

// // Handle new campaign creation
// export function handleCampaignCreated(event: CampaignCreatedEvent): void {
//   // Create Campaign entity
//   let campaign = new Campaign(event.params.campaignAddress.toHex());
//   campaign.name = event.params.name;
//   campaign.charity = event.params.charityAddress;
//   campaign.totalDonated = BigInt.zero();
//   campaign.createdAt = event.block.timestamp;
//   campaign.save();

//   // Instantiate data source for the new campaign
//   CharityCampaign.create(event.params.campaignAddress);
// }

// // Handle donations to any campaign
// export function handleDonationReceived(event: DonationReceivedEvent): void {
//   // Update Donor
//   let donorId = event.params.donor.toHex();
//   let donor = Donor.load(donorId);
//   if (!donor) {
//     donor = new Donor(donorId);
//     donor.totalDonated = BigInt.zero();
//     donor.campaignsSupported = 0;
//   }

//   // Use .plus() instead of +=
//   donor.totalDonated = donor.totalDonated.plus(event.params.amount);

//   // Use .plus() for integer increments
//   donor.campaignsSupported = donor.campaignsSupported + 1;
//   donor.save();

//   // Update Campaign
//   let campaign = Campaign.load(event.address.toHex());
//   if (campaign) {
//     campaign.totalDonated = campaign.totalDonated.plus(event.params.amount);
//     campaign.save();
//   }

//   // Create Donation record
//   let donation = new Donation(event.transaction.hash.toHex());
//   donation.amount = event.params.amount;
//   donation.donor = donorId;
//   donation.campaign = event.address.toHex();
//   donation.timestamp = event.block.timestamp;
//   donation.save();
// }

import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  CharityCentral,
  CharityVerified,
  CampaignCreated,
} from '../generated/CharityCentral/CharityCentral';
import { CharityCampaign as CharityCampaignTemplate } from '../generated/templates';
import { Charity, Campaign } from '../generated/schema';

export function handleCharityVerified(event: CharityVerified): void {
  let charityId = event.params.charityAddress.toHexString();
  let charity = Charity.load(charityId);

  if (!charity) {
    charity = new Charity(charityId);
    charity.address = event.params.charityAddress;
    charity.name = event.params.name;
    charity.isVerified = true;
    charity.save();
  } else {
    charity.name = event.params.name;
    charity.isVerified = true;
    charity.save();
  }
}

export function handleCampaignCreated(event: CampaignCreated): void {
  let campaignId = event.params.campaignAddress.toHexString();
  let charityId = event.params.charityAddress.toHexString();

  // Make sure charity exists
  let charity = Charity.load(charityId);
  if (!charity) {
    charity = new Charity(charityId);
    charity.address = event.params.charityAddress;
    charity.name = 'Unknown Charity'; // Default name
    charity.isVerified = true; // Must be verified to create campaign
    charity.save();
  }

  // Create campaign entity
  let campaign = new Campaign(campaignId);
  campaign.address = event.params.campaignAddress;
  campaign.charity = charityId;
  campaign.name = event.params.name;
  campaign.description = ''; // Will be updated when we fetch campaign details
  campaign.goal = event.params.goal;
  campaign.totalDonated = BigInt.fromI32(0);
  campaign.state = 'Active';
  campaign.topDonors = [];
  campaign.createdAt = event.block.timestamp;
  campaign.save();

  // Start tracking the new campaign contract
  CharityCampaignTemplate.create(event.params.campaignAddress);
}
