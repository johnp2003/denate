// charity-campaign.ts
import { BigInt, Address, store, log } from '@graphprotocol/graph-ts';
import {
  CharityCampaign as CharityCampaignContract,
  DonationReceived,
  MilestoneReached,
  FundsReleased,
  CampaignDeactivated,
  CampaignCompleted,
  TopDonorsAwarded,
} from '../generated/templates/CharityCampaign/CharityCampaign';
import {
  Campaign,
  Donor,
  CampaignDonor,
  Donation,
  Milestone,
} from '../generated/schema';

// Helper function to update top donors for a campaign
function updateCampaignTopDonors(campaignId: string): void {
  let campaign = Campaign.load(campaignId);
  if (!campaign) return;

  // Load all campaign donors
  let campaignDonors = campaign.donors.load();
  let sortedDonors = campaignDonors.sort((a, b) => {
    if (a.totalDonated > b.totalDonated) return -1;
    if (a.totalDonated < b.totalDonated) return 1;
    return 0;
  });

  // Update ranks and top donors
  let topDonors: string[] = [];
  for (let i = 0; i < sortedDonors.length; i++) {
    let donor = sortedDonors[i];
    donor.rank = i + 1;
    donor.save();
    if (i < 3) {
      // Top 3 donors
      topDonors.push(donor.id);
    }
  }

  campaign.topDonors = topDonors;
  campaign.save();
}

export function handleDonationReceived(event: DonationReceived): void {
  let campaignId = event.address.toHexString();
  let donorId = event.params.donor.toHexString();
  let campaignDonorId = campaignId + '-' + donorId;
  let donationId =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();

  // Update donor global entity
  let donor = Donor.load(donorId);
  if (!donor) {
    donor = new Donor(donorId);
    donor.address = event.params.donor;
    donor.totalDonated = event.params.amount;
    donor.save();
  } else {
    donor.totalDonated = donor.totalDonated.plus(event.params.amount);
    donor.save();
  }

  // Update campaign donor entity
  let campaignDonor = CampaignDonor.load(campaignDonorId);
  if (!campaignDonor) {
    campaignDonor = new CampaignDonor(campaignDonorId);
    campaignDonor.campaign = campaignId;
    campaignDonor.donor = donorId;
    campaignDonor.totalDonated = event.params.amount;
    campaignDonor.isTopDonor = false;
    campaignDonor.rank = 0;
    campaignDonor.save();
  } else {
    campaignDonor.totalDonated = event.params.totalDonated;
    campaignDonor.save();
  }

  // Create donation entity
  let donation = new Donation(donationId);
  donation.donor = donorId;
  donation.campaign = campaignId;
  donation.amount = event.params.amount;
  donation.timestamp = event.block.timestamp;
  donation.save();

  // Update campaign total donated
  let campaign = Campaign.load(campaignId);
  if (campaign) {
    campaign.totalDonated = campaign.totalDonated.plus(event.params.amount);
    campaign.save();

    // Update campaign top donors
    updateCampaignTopDonors(campaignId);
  }
}

export function handleMilestoneReached(event: MilestoneReached): void {
  let campaignId = event.address.toHexString();
  let milestoneId = campaignId + '-' + event.params.milestoneIndex.toString();

  let milestone = Milestone.load(milestoneId);
  if (!milestone) {
    milestone = new Milestone(milestoneId);
    milestone.campaign = campaignId;
    milestone.index = event.params.milestoneIndex.toI32();
    milestone.target = event.params.amount;
    milestone.reached = true;
    milestone.reachedAt = event.block.timestamp;
    milestone.fundsReleased = false;
  } else {
    milestone.reached = true;
    milestone.reachedAt = event.block.timestamp;
  }
  milestone.save();
}

export function handleFundsReleased(event: FundsReleased): void {
  let campaignId = event.address.toHexString();
  let milestoneId = campaignId + '-' + event.params.milestoneIndex.toString();

  let milestone = Milestone.load(milestoneId);
  if (milestone) {
    milestone.fundsReleased = true;
    milestone.save();
  }
}

export function handleCampaignDeactivated(event: CampaignDeactivated): void {
  let campaignId = event.address.toHexString();
  let campaign = Campaign.load(campaignId);
  if (campaign) {
    campaign.state = 'Deactivated';
    campaign.save();
  }
}

export function handleCampaignCompleted(event: CampaignCompleted): void {
  let campaignId = event.address.toHexString();
  let campaign = Campaign.load(campaignId);
  if (campaign) {
    campaign.state = 'Completed';
    campaign.save();
    updateCampaignTopDonors(campaignId); // Final update of top donors
  }
}

export function handleTopDonorsAwarded(event: TopDonorsAwarded): void {
  let campaignId = event.address.toHexString();
  updateCampaignTopDonors(campaignId);
}
