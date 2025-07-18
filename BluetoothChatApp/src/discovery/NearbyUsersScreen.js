import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { discoverPeers } from './DiscoveryService';

const NearbyUsersScreen = () => {
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    discoverPeers(device => setPeers(prev => [...prev, device]));
  }, []);

  return (
    <View>
      <Text>Nearby Users</Text>
      <FlatList
        data={peers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    </View>
  );
};

export default NearbyUsersScreen;
