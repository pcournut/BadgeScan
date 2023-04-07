import React, { useState, useEffect } from "react";
import {
  Image,
  FlatList,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from "react-native";
import sharedStyles from "../styles/shared";
import configureStyles from "../styles/configure";
import { Org, Event, Badge, BadgeEntity, User, EnrichedUser } from "../types";
import { Feather } from "@expo/vector-icons";

export const ConfigureScreen = ({ navigation, route }) => {
  // Functions
  const eventInit = async (token: string, orgId?: string, eventId?: string) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var formdata = new FormData();
    if (orgId != null) {
      formdata.append("orgId", orgId);
    }
    if (eventId != null) {
      formdata.append("eventId", eventId);
    }
    console.log(`formdata ${formdata}`);

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://club-soda-test-pierre.bubbleapps.io/version-test/api/1.1/wf/KentoEventInit",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      if ("orgs" in json.response && json.response.orgs.length > 0) {
        setOrgs(json.response.orgs);
      }
      if ("events" in json.response && json.response.events.length > 0) {
        setEvents(json.response.events);
      }
      if ("badges" in json.response && json.response.badges.length > 0) {
        const badges: [Badge] = json.response.badges;
        setBadges(
          badges.map((badge) => {
            badge.max_supply =
              badge.max_supply !== undefined
                ? badge.max_supply
                : badge.rollup_maxEntities;
            badge.isSelect = false;
            return badge;
          })
        );
      }
      if ("scanTerminal" in json.response) {
        setScanTerminal(json.response.scanTerminal);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const unitSelectBadgesCall = async (
    token: String,
    badges: Badge[],
    cursor: number
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const badgeEntityResponse = await fetch(
        `https://kento.events/version-test/api/1.1/obj/BadgeEntity?api_token=d86b5a64e3e852fa606cc7553e7257b2&constraints=[{ "key": "parent_badge","constraint_type":"in","value":[${badges.map(
          ({ _id }) => '"' + _id + '"'
        )}]}]&cursor=${cursor}`,
        requestOptions
      );
      const badgeEntityJSON = await badgeEntityResponse.json();
      if (
        "results" in badgeEntityJSON.response &&
        badgeEntityJSON.response.results.length > 0
      ) {
        const badgeEntities: [BadgeEntity] = badgeEntityJSON.response.results;
        const userResponse = await fetch(
          `https://kento.events/version-test/api/1.1/obj/User?api_token=d86b5a64e3e852fa606cc7553e7257b2&constraints=[{ "key": "_id","constraint_type":"in","value":[${badgeEntities.map(
            ({ owner }) => '"' + owner + '"'
          )}]}]&cursor=0`,
          requestOptions
        );
        // console.log(`response ${await userResponse.text()}`);
        const userJSON = await userResponse.json();
        if (
          "results" in userJSON.response &&
          userJSON.response.results.length > 0
        ) {
          const users: [User] = userJSON.response.results;
          var enrichedUsers: EnrichedUser[] = [];
          for (const badgeEntity of badgeEntities) {
            badgeEntity.isUsed = badgeEntity.scan_information !== undefined;
            badgeEntity.isSelect = false;
            badgeEntity.toUpdate = false;
            var badge: Badge = badges.find(
              (badge) => badge._id === badgeEntity.parent_badge
            );
            badgeEntity.parentBadgeName = badge.name;
            badgeEntity.parentBadgeIcon = badge.icon;
            var userIndex = enrichedUsers.findIndex(
              (user) => user._id === badgeEntity.owner
            );
            if (userIndex !== -1) {
              enrichedUsers[userIndex].badgeEntities.push(badgeEntity);
            } else {
              var user: User = users.find(
                (user) => user._id === badgeEntity.owner
              );
              if (user === undefined) {
                // Handle missing owner fields in Bubble (deleted in 03.2023)
                console.log(`error with badgeEntity: ${badgeEntity._id}`);
              } else {
                const enrichedUser: EnrichedUser = {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  // Handle empty user emails for search in ListTab
                  email: user.email == null ? "" : user.email,
                  badgeEntities: [badgeEntity],
                };
                enrichedUsers.push(enrichedUser);
              }
            }
          }

          return enrichedUsers;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const selectBadges = async (token: String, badges: Badge[]) => {
    // Prepare parallel requests
    const requestNumber: number = Math.ceil(
      badges.map((badge) => badge.max_supply).reduce((a, b) => a + b) / 100
    );

    try {
      const enrichedUsersList = await Promise.all(
        [...Array(requestNumber).keys()].map((cursor) =>
          unitSelectBadgesCall(token, badges, 100 * cursor)
        )
      );
      const enrichedUsers = enrichedUsersList
        .flat()
        // Handle empty response
        .filter((enrichedUser) => enrichedUser !== undefined);
      const enrichedUsersBadgeEntitiesNumber: number[] = enrichedUsers.map(
        (enrichedUser) => enrichedUser.badgeEntities.length
      );
      const nBadgeEntites: number = enrichedUsersBadgeEntitiesNumber.reduce(
        (a, b) => a + b
      );

      navigation.navigate("Scan", {
        token: route.params.token,
        scanTerminal: scanTerminal,
        badges: badges,
        nBadgeEntities: nBadgeEntites,
        enrichedUsers: enrichedUsers,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  // Components
  type OrgItemProps = {
    org: Org;
  };
  const OrgItem = ({ org }: OrgItemProps) => (
    <View style={configureStyles.orgContainer}>
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1.0,
          },
        ]}
        onPress={() => {
          setEvents([]);
          setBadges([]);
          eventInit(route.params.token, org._id);
        }}
      >
        <Text style={sharedStyles.blackText}>{org.name}</Text>
        <Image
          style={{ width: 80, height: 80, borderRadius: 80 / 2, marginTop: 10 }}
          source={{
            uri: `https:${org.logo}`,
          }}
        />
      </Pressable>
    </View>
  );

  type EventItemProps = {
    event: Event;
  };
  const EventItem = ({ event }: EventItemProps) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1.0,
        },
      ]}
      onPress={() => {
        eventInit(route.params.token, null, event._id);
      }}
    >
      <View style={configureStyles.eventContainer}>
        <Image
          style={{
            width: 60,
            height: 60,
            borderRadius: 60 / 2,
            marginRight: 10,
          }}
          source={{
            uri: `https:${event.main_picture}`,
          }}
        />
        <Text style={sharedStyles.blackText}>{event.name}</Text>
      </View>
    </Pressable>
  );

  type BadgeItemProps = {
    badge: Badge;
  };
  const BadgeItem = ({ badge }: BadgeItemProps) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1.0,
        },
      ]}
      onPress={() => {
        selectItem(badge);
      }}
    >
      <View style={configureStyles.badgeContainer}>
        <View style={configureStyles.eventContainer}>
          <Image
            style={{
              width: 60,
              height: 60,
              borderRadius: 60 / 2,
              marginRight: 10,
            }}
            source={{
              uri: `https:${badge.icon}`,
            }}
          />
          <Text style={sharedStyles.blackText}>{badge.name}</Text>
        </View>
        {badge.isSelect ? (
          <Feather name="x-square" size={24} color="black" />
        ) : (
          <Feather name="square" size={24} color="black" />
        )}
      </View>
    </Pressable>
  );

  const selectItem = (badge: Badge) => {
    badge.isSelect = !badge.isSelect;
    var newBadges = Object.assign([], badges);
    const index = newBadges.findIndex((item) => item._id === badge._id);
    newBadges[index] = badge;
    setBadges(newBadges);
  };

  // State variables
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [scanTerminal, setScanTerminal] = useState<string>("");

  // Init
  useEffect(() => {
    eventInit(route.params.token);
  }, [navigation]);

  return (
    <SafeAreaView style={configureStyles.mainContainer}>
      <Text style={configureStyles.subtitle}>Select an organisation</Text>
      <FlatList
        style={{ flex: 3 }}
        horizontal={true}
        data={orgs}
        renderItem={({ item }) => <OrgItem org={item} />}
        keyExtractor={(item) => item._id}
      />
      <Text style={configureStyles.subtitle}>Select an event</Text>
      <FlatList
        style={{ flex: 3 }}
        data={events}
        renderItem={({ item }) => <EventItem event={item} />}
        keyExtractor={(item) => item._id}
      />
      <Text style={configureStyles.subtitle}>
        Select the pass you want to scan
      </Text>
      <FlatList
        style={{ flex: 3 }}
        data={badges}
        renderItem={({ item }) => <BadgeItem badge={item} />}
        keyExtractor={(item) => item._id}
        extraData={badges}
      />
      <View style={{ alignItems: "center", height: "8%", marginBottom: "10%" }}>
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1.0,
            },
            badges.filter((item: Badge) => item.isSelect).length > 0
              ? configureStyles.pinkButton
              : configureStyles.greyButton,
          ]}
          onPress={() => {
            if (badges.length > 0) {
              const selectedBadges: Badge[] = badges.filter(
                (item: Badge) => item.isSelect
              );
              selectBadges(route.params.token, selectedBadges);
            }
          }}
        >
          <Text style={sharedStyles.textPinkButton}>Start to scan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
