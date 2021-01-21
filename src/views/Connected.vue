<template>
  <div class="connected page">
    <h2 class="text-green-800 px-4 my-4">CONNECTED</h2>
    <profile-switch
      :status="connectedProfile.status"
      :name="connectedProfile.name"
      :domain="connectedProfile.domain"
    />
    <h2 class="text-blue-900 py-5 mx-4 border-t-2 mt-2 border-gray-500">
      CONNECTION STATS
    </h2>
    <div id="graph" class="bg-gray-200 w-full h-60 relative overflow-hidden">
      <canvas ref="canvas"></canvas>
    </div>
    <font-awesome-icon icon="arrow-up" />
    <font-awesome-icon icon="arrow-down" />
    <pre v-for="(i, index) in statistics.BYTES_IN" :key="index">
      {{ counter % interval == index ? i + "  &lt;" : i }}
    </pre>
    <hr />
    <pre>
      {{ inBW }}
    </pre>
  </div>
</template>

<script>
import ProfileSwitch from "@/components/ProfileSwitch";
import Chart from "chart.js";
import { mapGetters } from "vuex";
import { exec } from "@/helper";
/* eslint-disable */
export default {
  name: "connected",
  components: { ProfileSwitch },
  data() {
    return {
      counter: 0,
      interval: 5,
      statistics: {
        BYTES_IN: [0, 0, 0, 0, 0],
        BYTES_OUT: [0, 0, 0, 0, 0],
        PACKETS_IN: [0, 0, 0, 0, 0],
        PACKETS_OUT: [0, 0, 0, 0, 0],
        TUN_BYTES_IN: [0, 0, 0, 0, 0],
        TUN_BYTES_OUT: [0, 0, 0, 0, 0],
        TUN_PACKETS_IN: [0, 0, 0, 0, 0],
        TUN_PACKETS_OUT: [0, 0, 0, 0, 0]
      }
    };
  },
  computed: {
    ...mapGetters(["connectedProfile"]),
    outBW() {
      const currentPosition = this.counter % 5=== 0 ? 4 : this.counter%5-1;
      const prvPosition = currentPosition === 0 ? 4 : currentPosition - 1;
      return parseInt(this.statistics.BYTES_OUT[currentPosition] - this.statistics.BYTES_OUT[prvPosition]);

    },
    inBW() {
      const currentPosition = this.counter % 5=== 0 ? 4 : this.counter%5-1;
      const prvPosition = currentPosition === 0 ? 4 : currentPosition - 1;
      return parseInt(this.statistics.BYTES_IN[currentPosition] - this.statistics.BYTES_IN[prvPosition]);
    }
  },
  methods: {
    watchBandwidth() {
      window.connection_status_interval = setInterval(async () => {
        try {
          let output = await exec([
            "openvpn3",
            "session-stats",
            "--config",
            "Kiev_KIEV_udp_53.ovpn"
          ]);

          output = output
            .split("\n")
            .filter(i => i !== "")
            .map(i => {
              return i.replace(/\s/g, "");
            })
            .map(i => {
              return i.split(/\.+/);
            });

          output.shift();

          output.forEach(i => {
            this.statistics[i[0]][this.counter % this.interval] = i[1] / 1000;
          });

          this.counter++;
        } catch (error) {
          console.error(error);
          this.statistics.BYTES_IN[this.counter % this.interval] = 0
          this.statistics.BYTES_OUT[this.counter % this.interval] = 0
        }
      }, this.interval * 1000);
    },
    updateGraph(newValue,datasetIndex) {
      window.chart.data.datasets[datasetIndex].data.shift();
      window.chart.data.datasets[datasetIndex].data.push(newValue);
      window.chart.update();
    }
  },
  mounted() {
    this.watchBandwidth(5);
    const randomScalingFactor = () => {
      return Math.ceil(Math.random() * 100);
    };
    var config = {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
        ],
        datasets: [
          {
            fill: "start",
            label: "download",
            backgroundColor: "#fbd702",
            borderColor: "#fbd702",
            data: [0,0,0,0,0]
            
            // fill: false
          },
          {
            label: "upload",
            fill: "start",
            backgroundColor: "#e87e22",
            borderColor: "#e87e22",
            data: [0,0,0,0,0]
          }
        ]
      },
      options: {
        responsive: true,
        title: {
          display: false,
          text: "Chart.js Line Chart"
        },
        tooltips: {
          mode: "index",
          intersect: false
        },
        hover: {
          mode: "nearest",
          intersect: true
        },
        scales: {
          xAxes: [
            {
              display: false,
              scaleLabel: {
                display: true,
                labelString: "Month"
              }
            }
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value"
              }
            }
          ]
        }
      }
    };

    var ctx = this.$refs.canvas.getContext("2d");
    window.chart = new Chart(ctx, config);

    window.update_graph = setInterval(() => {
      this.updateGraph(this.inBW,0)
      this.updateGraph(this.outBW,1)

    }, this.interval*1000);
  },
  unmounted() {
    delete window.chart;
    clearInterval(window.connection_status_interval);
    clearInterval(window.update_graph);
  }
};
</script>

<style></style>
